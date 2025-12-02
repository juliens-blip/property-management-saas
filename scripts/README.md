# Scripts de Duplication Claude Code

## duplicate-claude-config.ps1

Script PowerShell pour dupliquer votre configuration Claude Code (agents, commandes, settings) vers un nouveau projet.

### Utilisation Simple

```powershell
# Mode interactif (recommandé)
.\scripts\duplicate-claude-config.ps1

# Avec chemin direct
.\scripts\duplicate-claude-config.ps1 -TargetPath "C:\path\to\new-project"

# Test sans modification (dry run)
.\scripts\duplicate-claude-config.ps1 -DryRun
```

### Ce qui est copié

```
.claude/
  ├── agents/              # Tous les agents (*.md)
  │   ├── mcp-creator.md
  │   ├── mcp-doctor.md
  │   ├── test-code.md
  │   ├── frontend-developer.md
  │   ├── prompt-engineer.md
  │   ├── explore-code.md
  │   └── explore-style.md
  ├── commands/            # Toutes les commandes slash (*.md)
  │   ├── epct.md
  │   ├── mcp.md
  │   ├── mcp-check.md
  │   └── mcp-fix.md
  └── settings.local.json  # Permissions
```

### Exemple d'Exécution

```powershell
PS> .\scripts\duplicate-claude-config.ps1

=== Duplication de Configuration Claude Code ===

[i] Projet source: C:\Users\beatr\Documents\property-management-saas

Entrez le chemin du projet cible (ou 'q' pour quitter): C:\projets\mon-nouveau-projet

[i] Cette opération va copier:
[i]   - Tous les agents (.claude/agents/*.md)
[i]   - Toutes les commandes (.claude/commands/*.md)
[i]   - Les settings (.claude/settings.local.json)

Continuer? (o/N): o

=== Copie des Agents ===
[✓] Copié: mcp-creator.md
[✓] Copié: mcp-doctor.md
[✓] Copié: test-code.md
[✓] Copié: frontend-developer.md
[✓] Copié: prompt-engineer.md
[✓] Copié: explore-code.md
[✓] Copié: explore-style.md

=== Copie des Commandes ===
[✓] Copié: epct.md
[✓] Copié: mcp.md
[✓] Copié: mcp-check.md
[✓] Copié: mcp-fix.md

=== Copie des Settings ===
[✓] settings.local.json copié

=== Rapport de Duplication ===

[i] Projet source: C:\Users\beatr\Documents\property-management-saas
[i] Projet cible: C:\projets\mon-nouveau-projet

[✓] Agents copiés: 7
[✓] Commandes copiées: 4
[✓] Settings copiés: Oui

=== Fichiers à Personnaliser (si nécessaire) ===
[!] .claude/commands/epct.md - Contient le schéma Airtable ResidConnect
[!] .claude/settings.local.json - Peut contenir des permissions spécifiques au projet

=== Prochaines Étapes ===
[i] 1. Adaptez .claude/commands/epct.md avec votre schéma Airtable (si différent)
[i] 2. Redémarrez Claude Code pour charger les nouveaux agents
[i] 3. Testez les commandes: /mcp, /mcp-check, /mcp-fix, /epct

[✓] Duplication terminée avec succès!
```

### Après la Duplication

1. **Redémarrez Claude Code** pour charger les nouveaux agents et commandes

2. **Personnalisez epct.md** si votre projet utilise un schéma Airtable différent :
   ```markdown
   Éditez: .claude/commands/epct.md
   Section: "Airtable Schema Quick Reference" (ligne 221+)
   ```

3. **Testez les commandes** :
   ```bash
   /mcp créer un serveur pour...
   /mcp-check mon-mcp
   /epct nouvelle fonctionnalité
   ```

### Notes

- Le script copie tout **tel quel** sans modification
- Si `settings.local.json` existe déjà dans la cible, vous pouvez choisir de fusionner les permissions
- Les agents sont réutilisables dans n'importe quel projet
- Seul `/epct` contient des références spécifiques à ResidConnect (schéma Airtable)
