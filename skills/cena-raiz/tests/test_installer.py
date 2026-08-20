import tempfile
import unittest
from pathlib import Path

import cenaraiz_install


class InstallerPayloadTests(unittest.TestCase):
    def make_source(self, root: Path) -> Path:
        source = root / "source"
        source.mkdir()
        for entry in cenaraiz_install.SKILL_PAYLOAD:
            path = source / entry
            if entry in {"agents", "assets", "helpers", "references"}:
                path.mkdir()
                (path / "fixture.txt").write_text(entry, encoding="utf-8")
            else:
                path.write_text(f"{entry}\n", encoding="utf-8")
        (source / "desktop").mkdir()
        (source / "desktop" / "must-not-install.txt").write_text(
            "desktop source", encoding="utf-8")
        (source / "contributor-only.txt").write_text(
            "not part of the skill", encoding="utf-8")
        return source

    def test_cenaraiz_install_copies_only_the_allowlisted_payload(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            source = self.make_source(root)
            skills = root / "skills"

            destination = cenaraiz_install.install_into(source, skills, force=False)

            self.assertEqual(destination, skills / "cena-raiz")
            self.assertFalse((destination / "desktop").exists())
            self.assertFalse((destination / "contributor-only.txt").exists())
            for entry in cenaraiz_install.SKILL_PAYLOAD:
                self.assertTrue((destination / entry).exists(), entry)

    def test_update_preserves_user_state_and_removes_old_repo_extras(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            source = self.make_source(root)
            skills = root / "skills"
            destination = skills / "cena-raiz"
            (destination / ".venv").mkdir(parents=True)
            (destination / ".venv" / "keep.txt").write_text(
                "venv", encoding="utf-8")
            (destination / ".env").write_text("SECRET=preserved\n", encoding="utf-8")
            (destination / "desktop").mkdir()
            (destination / "desktop" / "stale.txt").write_text(
                "remove", encoding="utf-8")

            cenaraiz_install.install_into(source, skills, force=False)

            self.assertEqual(
                (destination / ".venv" / "keep.txt").read_text(encoding="utf-8"),
                "venv",
            )
            self.assertEqual(
                (destination / ".env").read_text(encoding="utf-8"),
                "SECRET=preserved\n",
            )
            self.assertFalse((destination / "desktop").exists())

    def test_incomplete_payload_does_not_modify_existing_install(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            source = self.make_source(root)
            (source / "SKILL.md").unlink()
            destination = root / "skills" / "cena-raiz"
            destination.mkdir(parents=True)
            marker = destination / "working-install.txt"
            marker.write_text("keep", encoding="utf-8")

            with self.assertRaises(FileNotFoundError):
                cenaraiz_install.install_into(source, root / "skills", force=False)

            self.assertEqual(marker.read_text(encoding="utf-8"), "keep")

    def test_third_party_skill_keeps_its_complete_tree(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            source = root / "remotion"
            (source / "nested").mkdir(parents=True)
            (source / "nested" / "router.md").write_text(
                "router", encoding="utf-8")

            destination = cenaraiz_install.install_into(
                source,
                root / "skills",
                force=False,
                name="remotion-best-practices",
            )

            self.assertEqual(
                (destination / "nested" / "router.md").read_text(encoding="utf-8"),
                "router",
            )

    def test_remotion_source_prefers_the_vendored_copy(self) -> None:
        """Sem isso, cada máquina nova volta a depender de download na hora."""
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            skills = root / "skills"
            vendored = skills / "remotion-best-practices"
            vendored.mkdir(parents=True)
            (vendored / "SKILL.md").write_text("router", encoding="utf-8")
            (vendored / "PROVENANCE.md").write_text("vendor", encoding="utf-8")

            resolved = cenaraiz_install.resolve_remotion_source(
                skills / "cena-raiz", root / "tmp")

            self.assertEqual(resolved, vendored)

    def test_remotion_source_ignores_a_sibling_without_the_vendor_marker(self) -> None:
        """Uma instalação anterior no mesmo diretório não é fonte confiável:
        seria congelar o usuário numa versão velha em vez de buscar o upstream."""
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            skills = root / "skills"
            antiga = skills / "remotion-best-practices"
            antiga.mkdir(parents=True)
            (antiga / "SKILL.md").write_text("stale", encoding="utf-8")

            chamadas = []
            original = cenaraiz_install.fetch_repo
            cenaraiz_install.fetch_repo = (
                lambda repo, ref, into, label: chamadas.append(repo) or None)
            try:
                resolved = cenaraiz_install.resolve_remotion_source(
                    skills / "cena-raiz", root / "tmp")
            finally:
                cenaraiz_install.fetch_repo = original

            self.assertIsNone(resolved)
            self.assertEqual(chamadas, [cenaraiz_install.REMOTION_REPO])

    def test_resolve_skill_source_accepts_monorepo_root(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            source = self.make_source(root)
            monorepo_skill = root / "monorepo" / "skills" / "cena-raiz"
            monorepo_skill.parent.mkdir(parents=True)
            source.rename(monorepo_skill)

            self.assertEqual(
                cenaraiz_install.resolve_skill_source(root / "monorepo"),
                monorepo_skill,
            )

    def test_real_skill_directory_matches_the_published_payload(self) -> None:
        real_skill = Path(cenaraiz_install.__file__).resolve().parent
        self.assertEqual(cenaraiz_install.resolve_skill_source(real_skill), real_skill)


if __name__ == "__main__":
    unittest.main()
