#!/usr/bin/env bash
#
# lib.sh — Funções compartilhadas pelos scripts do pipeline. Não execute direto; use `source`.

# Lê um arquivo de prompts, ignorando linhas vazias e comentários (#).
# Preenche o array global PROMPTS.
read_prompts() {
  local file="$1"
  [[ -f "$file" ]] || { echo "ERRO: arquivo de prompt não encontrado: $file" >&2; return 1; }
  PROMPTS=()
  local line
  while IFS= read -r line || [[ -n "$line" ]]; do
    [[ "$line" =~ ^[[:space:]]*$ ]] && continue
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    PROMPTS+=("$line")
  done < "$file"
  [[ ${#PROMPTS[@]} -gt 0 ]] || { echo "ERRO: nenhum prompt válido em $file" >&2; return 1; }
}

# Extrai a URL do resultado de uma resposta --json do higgsfield.
# A resposta pode ser um objeto ou um array; limpa bytes de controle antes do jq.
extract_url() {
  echo "$1" | tr -d '\000-\010\013\014\016-\037' \
    | jq -r '(if type=="array" then .[0] else . end)
             | .result_url // (.result_urls // [])[0] // .url // empty'
}

# Baixa uma URL pra um arquivo, falhando alto se o download não completar.
download_to() {
  local url="$1" out="$2"
  curl -sSL --fail --retry 2 -o "$out" "$url"
}

# Considera um arquivo "já pronto" se existe e tem tamanho plausível (evita retrabalho e stubs vazios).
already_done() {
  local f="$1" min="${2:-20000}"
  [[ -f "$f" ]] || return 1
  local size
  size=$(stat -f%z "$f" 2>/dev/null || stat -c%s "$f" 2>/dev/null || echo 0)
  [[ "$size" -gt "$min" ]]
}
