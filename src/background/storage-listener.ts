import browser from 'webextension-polyfill'
import { STORAGE_KEYS } from '../shared/constants'
import { rebuildRules } from './dnr-manager'

/**
 * Handle storage changes (e.g. from sync)
 * Triggers rule rebuilds when blocking configuration changes
 */
export async function handleStorageChange(
    changes: browser.Storage.StorageAreaOnChangedChangesType,
    areaName: string
): Promise<void> {
    // We only care about sync storage changes for global settings
    // Local storage changes are usually triggered by this same device 
    // (and handled by the specific action handler), but we should be robust.
    if (areaName !== 'sync' && areaName !== 'local') return

    const keys = Object.keys(changes)
    let shouldRebuild = false

    // Check if any rule-affecting keys changed
    if (keys.includes(STORAGE_KEYS.BLOCKED_SITES)) {
        console.log('[Storage Listener] Blocked sites changed, rebuilding rules')
        shouldRebuild = true
    }

    if (keys.includes(STORAGE_KEYS.STRICT_MODE)) {
        console.log('[Storage Listener] Strict mode changed, rebuilding rules')
        shouldRebuild = true
    }

    if (keys.includes(STORAGE_KEYS.TEMP_WHITELIST)) {
        console.log('[Storage Listener] Temp whitelist changed, rebuilding rules')
        shouldRebuild = true
    }

    if (shouldRebuild) {
        try {
            await rebuildRules()
        } catch (err) {
            console.error('[Storage Listener] Error rebuilding rules after storage change:', err)
        }
    }
}

/**
 * Initialize storage change listener
 */
export function initializeStorageListener(): void {
    browser.storage.onChanged.addListener(handleStorageChange)
    console.log('[Storage Listener] Initialized')
}
