#!/usr/bin/env python3
"""Valida um Constraint Manifest contra o esquema e as regras semanticas.

Deterministico e sem dependencia externa: nenhuma IA participa desta validacao,
conforme a Secao 8 da doutrina (Generator -> Validator -> Policy Check).

A estrutura vem de constraint-manifest.schema.json, que continua sendo a fonte
unica: campos obrigatorios, tipos e enums sao lidos de la, nunca reescritos aqui.
Este arquivo acrescenta apenas o que o esquema nao consegue expressar.

Uso:
    python3 validar-constraint-manifest.py MANIFESTO [MANIFESTO ...]
    python3 validar-constraint-manifest.py --formato json MANIFESTO

Saida: relatorio legivel e codigo 0 quando valido, 1 quando invalido.
"""

from __future__ import annotations

import argparse
import json
import pathlib
import sys

AQUI = pathlib.Path(__file__).resolve().parent
ESQUEMA = AQUI / "constraint-manifest.schema.json"

# Cobertura minima exigida por nivel. O nivel completo exige os doze blocos,
# derivados do proprio enum do esquema.
COBERTURA_MINIMA = {
    "approval_boundary",
    "stop_condition",
    "reversibility_requirement",
}
COBERTURA_MINIMA_ALTERNATIVA = {"forbidden_outcome", "forbidden_method"}

TIPOS = {
    "object": dict,
    "array": list,
    "string": str,
    "number": (int, float),
    "boolean": bool,
}


def checar_esquema(valor, esquema: dict, caminho: str, erros: list[str]) -> None:
    """Subconjunto de JSON Schema suficiente para este contrato."""
    tipo = esquema.get("type")
    if tipo and not isinstance(valor, TIPOS[tipo]):
        erros.append(f"{caminho}: esperado {tipo}, encontrado {type(valor).__name__}")
        return

    if "enum" in esquema and valor not in esquema["enum"]:
        erros.append(f"{caminho}: valor {valor!r} fora de {esquema['enum']}")
        return

    if tipo == "object":
        for obrigatorio in esquema.get("required", []):
            if obrigatorio not in valor:
                erros.append(f"{caminho}: campo obrigatorio ausente: {obrigatorio}")
        propriedades = esquema.get("properties", {})
        if esquema.get("additionalProperties") is False:
            for chave in valor:
                if chave not in propriedades:
                    erros.append(f"{caminho}: campo desconhecido: {chave}")
        for chave, sub in propriedades.items():
            if chave in valor:
                checar_esquema(valor[chave], sub, f"{caminho}.{chave}", erros)

    if tipo == "array":
        minimo = esquema.get("minItems")
        if minimo is not None and len(valor) < minimo:
            erros.append(f"{caminho}: exige ao menos {minimo} item(ns)")
        item = esquema.get("items")
        if item:
            for indice, elemento in enumerate(valor):
                checar_esquema(elemento, item, f"{caminho}[{indice}]", erros)


def checar_semantica(manifesto: dict, esquema: dict, erros: list[str], avisos: list[str]) -> None:
    """Regras que o esquema nao expressa."""
    restricoes = manifesto.get("constraints")
    if not isinstance(restricoes, list):
        return

    vistos: set[str] = set()
    for indice, restricao in enumerate(restricoes):
        if not isinstance(restricao, dict):
            continue
        caminho = f"constraints[{indice}]"
        identificador = restricao.get("id")
        if isinstance(identificador, str):
            if identificador in vistos:
                erros.append(f"{caminho}: id duplicado: {identificador}")
            vistos.add(identificador)

        aplicacao = restricao.get("enforcement")
        if isinstance(aplicacao, dict):
            mecanismo = aplicacao.get("mechanism")
            # Doutrina 19.2: restricao sem ponto de aplicacao e prosa decorativa.
            if mecanismo == "manual" and not aplicacao.get("responsible"):
                erros.append(
                    f"{caminho}: mecanismo manual exige responsavel nomeado (enforcement.responsible)"
                )
            if mecanismo in {"type", "schema", "test", "permission", "policy", "monitor"} and not aplicacao.get("reference"):
                erros.append(f"{caminho}: mecanismo {mecanismo} exige enforcement.reference")

        if restricao.get("status") == "ACCEPTED" and not restricao.get("source"):
            erros.append(f"{caminho}: restricao ACCEPTED exige source com a evidencia que a sustenta")

        if restricao.get("status") == "PROPOSAL":
            avisos.append(f"{caminho}: {identificador} aguarda decisao humana (PROPOSAL)")

    sistema = manifesto.get("system", {})
    nivel = sistema.get("tier") if isinstance(sistema, dict) else None
    classes = {r.get("class") for r in restricoes if isinstance(r, dict)}

    if nivel == "completo":
        todas = set(
            esquema["properties"]["constraints"]["items"]["properties"]["class"]["enum"]
        )
        faltando = sorted(todas - classes)
        if faltando:
            erros.append(f"nivel completo exige os doze blocos; faltam: {', '.join(faltando)}")
    elif nivel == "minimo":
        faltando = sorted(COBERTURA_MINIMA - classes)
        if faltando:
            erros.append(f"nivel minimo exige: {', '.join(faltando)}")
        if not (COBERTURA_MINIMA_ALTERNATIVA & classes):
            erros.append("nivel minimo exige forbidden_outcome ou forbidden_method")


def validar(caminho: pathlib.Path, esquema: dict) -> dict:
    erros: list[str] = []
    avisos: list[str] = []
    try:
        manifesto = json.loads(caminho.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as erro:
        return {"arquivo": str(caminho), "valido": False, "erros": [str(erro)], "avisos": []}

    checar_esquema(manifesto, esquema, "manifesto", erros)
    if not erros:
        checar_semantica(manifesto, esquema, erros, avisos)

    return {
        "arquivo": str(caminho),
        "valido": not erros,
        "erros": erros,
        "avisos": avisos,
        "restricoes": len(manifesto.get("constraints", []) or []),
    }


def main() -> int:
    analisador = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    analisador.add_argument("manifestos", nargs="+", type=pathlib.Path)
    analisador.add_argument("--formato", choices=["texto", "json"], default="texto")
    argumentos = analisador.parse_args()

    esquema = json.loads(ESQUEMA.read_text(encoding="utf-8"))
    resultados = [validar(caminho, esquema) for caminho in argumentos.manifestos]

    if argumentos.formato == "json":
        print(json.dumps(resultados, ensure_ascii=False, indent=2))
    else:
        for resultado in resultados:
            marca = "OK  " if resultado["valido"] else "FALHA"
            print(f"{marca} {resultado['arquivo']} ({resultado.get('restricoes', 0)} restricoes)")
            for erro in resultado["erros"]:
                print(f"      erro:  {erro}")
            for aviso in resultado["avisos"]:
                print(f"      aviso: {aviso}")

    return 0 if all(resultado["valido"] for resultado in resultados) else 1


if __name__ == "__main__":
    sys.exit(main())
