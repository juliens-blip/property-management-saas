# ============================================================
# Script de Duplication de Configuration Claude Code
# ============================================================
# Copie les agents, commandes et settings vers un nouveau projet
# Aucune modification - copie brute pour réutilisation

param(
    [Parameter(Mandatory=$false)]
    [string]$TargetPath,

    [Parameter(Mandatory=$false)]
    [switch]$DryRun
)

# Couleurs pour l'affichage
function Write-Success { param($msg) Write-Host "[✓] $msg" -ForegroundColor Green }
function Write-Info { param($msg) Write-Host "[i] $msg" -ForegroundColor Cyan }
function Write-Warning { param($msg) Write-Host "[!] $msg" -ForegroundColor Yellow }
function Write-Error { param($msg) Write-Host "[✗] $msg" -ForegroundColor Red }
function Write-Title { param($msg) Write-Host "`n=== $msg ===" -ForegroundColor Magenta }

# Configuration
$SourceRoot = Split-Path -Parent $PSScriptRoot
$ClaudeDir = ".claude"

# Statistiques
$Stats = @{
    AgentsCopied = 0
    CommandsCopied = 0
    SettingsCopied = $false
    Errors = 0
}

# ============================================================
# FONCTION: Demander le chemin cible
# ============================================================
function Get-TargetPath {
    if ($TargetPath) {
        return $TargetPath
    }

    Write-Title "Duplication de Configuration Claude Code"
    Write-Host ""
    Write-Info "Projet source: $SourceRoot"
    Write-Host ""

    $path = Read-Host "Entrez le chemin du projet cible (ou 'q' pour quitter)"

    if ($path -eq 'q') {
        Write-Warning "Opération annulée"
        exit 0
    }

    return $path
}

# ============================================================
# FONCTION: Vérifier que le projet cible existe
# ============================================================
function Test-TargetProject {
    param([string]$Path)

    if (-not (Test-Path $Path)) {
        Write-Error "Le chemin '$Path' n'existe pas"
        return $false
    }

    return $true
}

# ============================================================
# FONCTION: Copier les agents
# ============================================================
function Copy-Agents {
    param([string]$TargetPath)

    Write-Title "Copie des Agents"

    $sourceAgentsDir = Join-Path $SourceRoot "$ClaudeDir\agents"
    $targetAgentsDir = Join-Path $TargetPath "$ClaudeDir\agents"

    if (-not (Test-Path $sourceAgentsDir)) {
        Write-Warning "Aucun agent trouvé dans le projet source"
        return
    }

    # Créer le dossier cible
    if (-not $DryRun) {
        New-Item -ItemType Directory -Path $targetAgentsDir -Force | Out-Null
    }

    # Copier tous les agents
    $agents = Get-ChildItem -Path $sourceAgentsDir -Filter "*.md"

    foreach ($agent in $agents) {
        $targetFile = Join-Path $targetAgentsDir $agent.Name

        if ($DryRun) {
            Write-Info "[DRY RUN] Copierait: $($agent.Name)"
        } else {
            Copy-Item -Path $agent.FullName -Destination $targetFile -Force
            Write-Success "Copié: $($agent.Name)"
        }

        $Stats.AgentsCopied++
    }
}

# ============================================================
# FONCTION: Copier les commandes
# ============================================================
function Copy-Commands {
    param([string]$TargetPath)

    Write-Title "Copie des Commandes"

    $sourceCommandsDir = Join-Path $SourceRoot "$ClaudeDir\commands"
    $targetCommandsDir = Join-Path $TargetPath "$ClaudeDir\commands"

    if (-not (Test-Path $sourceCommandsDir)) {
        Write-Warning "Aucune commande trouvée dans le projet source"
        return
    }

    # Créer le dossier cible
    if (-not $DryRun) {
        New-Item -ItemType Directory -Path $targetCommandsDir -Force | Out-Null
    }

    # Copier toutes les commandes
    $commands = Get-ChildItem -Path $sourceCommandsDir -Filter "*.md"

    foreach ($command in $commands) {
        $targetFile = Join-Path $targetCommandsDir $command.Name

        if ($DryRun) {
            Write-Info "[DRY RUN] Copierait: $($command.Name)"
        } else {
            Copy-Item -Path $command.FullName -Destination $targetFile -Force
            Write-Success "Copié: $($command.Name)"
        }

        $Stats.CommandsCopied++
    }
}

# ============================================================
# FONCTION: Fusionner settings.local.json
# ============================================================
function Merge-Settings {
    param([string]$TargetPath)

    Write-Title "Copie des Settings"

    $sourceSettingsFile = Join-Path $SourceRoot "$ClaudeDir\settings.local.json"
    $targetSettingsFile = Join-Path $TargetPath "$ClaudeDir\settings.local.json"

    if (-not (Test-Path $sourceSettingsFile)) {
        Write-Warning "Aucun settings.local.json dans le projet source"
        return
    }

    # Lire le fichier source
    $sourceSettings = Get-Content -Path $sourceSettingsFile -Raw | ConvertFrom-Json

    # Vérifier si le fichier cible existe
    if (Test-Path $targetSettingsFile) {
        Write-Warning "settings.local.json existe déjà dans le projet cible"

        $overwrite = Read-Host "Voulez-vous fusionner les permissions? (o/N)"

        if ($overwrite -eq 'o') {
            $targetSettings = Get-Content -Path $targetSettingsFile -Raw | ConvertFrom-Json

            # Fusionner les permissions (éviter les doublons)
            $mergedPermissions = @($targetSettings.permissions.allow) + @($sourceSettings.permissions.allow) | Select-Object -Unique

            $targetSettings.permissions.allow = $mergedPermissions

            if (-not $DryRun) {
                $targetSettings | ConvertTo-Json -Depth 10 | Set-Content -Path $targetSettingsFile -Force
                Write-Success "Permissions fusionnées: $(($mergedPermissions | Measure-Object).Count) permissions uniques"
            } else {
                Write-Info "[DRY RUN] Fusionnerait $(($mergedPermissions | Measure-Object).Count) permissions"
            }
        } else {
            Write-Info "Fusion ignorée - fichier cible conservé"
        }
    } else {
        # Copier directement le fichier
        if (-not $DryRun) {
            New-Item -ItemType Directory -Path (Split-Path $targetSettingsFile) -Force | Out-Null
            Copy-Item -Path $sourceSettingsFile -Destination $targetSettingsFile -Force
            Write-Success "settings.local.json copié"
        } else {
            Write-Info "[DRY RUN] Copierait settings.local.json"
        }
    }

    $Stats.SettingsCopied = $true
}

# ============================================================
# FONCTION: Générer un rapport
# ============================================================
function Show-Report {
    param([string]$TargetPath)

    Write-Title "Rapport de Duplication"

    Write-Host ""
    Write-Info "Projet source: $SourceRoot"
    Write-Info "Projet cible: $TargetPath"
    Write-Host ""

    Write-Success "Agents copiés: $($Stats.AgentsCopied)"
    Write-Success "Commandes copiées: $($Stats.CommandsCopied)"

    if ($Stats.SettingsCopied) {
        Write-Success "Settings copiés: Oui"
    } else {
        Write-Warning "Settings copiés: Non"
    }

    if ($Stats.Errors -gt 0) {
        Write-Error "Erreurs rencontrées: $($Stats.Errors)"
    }

    Write-Host ""
    Write-Title "Fichiers à Personnaliser (si nécessaire)"
    Write-Warning ".claude/commands/epct.md - Contient le schéma Airtable ResidConnect"
    Write-Warning ".claude/settings.local.json - Peut contenir des permissions spécifiques au projet"
    Write-Host ""

    Write-Title "Prochaines Étapes"
    Write-Info "1. Adaptez .claude/commands/epct.md avec votre schéma Airtable (si différent)"
    Write-Info "2. Redémarrez Claude Code pour charger les nouveaux agents"
    Write-Info "3. Testez les commandes: /mcp, /mcp-check, /mcp-fix, /epct"
    Write-Host ""
}

# ============================================================
# MAIN
# ============================================================
try {
    # Obtenir le chemin cible
    $TargetPath = Get-TargetPath

    # Vérifier le projet cible
    if (-not (Test-TargetProject -Path $TargetPath)) {
        exit 1
    }

    if ($DryRun) {
        Write-Warning "MODE DRY RUN - Aucun fichier ne sera modifié"
        Write-Host ""
    }

    # Afficher un résumé avant de commencer
    Write-Host ""
    Write-Info "Cette opération va copier:"
    Write-Info "  - Tous les agents (.claude/agents/*.md)"
    Write-Info "  - Toutes les commandes (.claude/commands/*.md)"
    Write-Info "  - Les settings (.claude/settings.local.json)"
    Write-Host ""

    if (-not $DryRun) {
        $confirm = Read-Host "Continuer? (o/N)"
        if ($confirm -ne 'o') {
            Write-Warning "Opération annulée"
            exit 0
        }
    }

    # Copier les agents
    Copy-Agents -TargetPath $TargetPath

    # Copier les commandes
    Copy-Commands -TargetPath $TargetPath

    # Copier/Fusionner les settings
    Merge-Settings -TargetPath $TargetPath

    # Afficher le rapport
    Show-Report -TargetPath $TargetPath

    Write-Success "`nDuplication terminée avec succès!"

} catch {
    Write-Error "Erreur fatale: $_"
    $Stats.Errors++
    exit 1
}
