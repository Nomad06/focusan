/**
 * Conditional Rules Modal Component
 * Allows users to configure conditional blocking rules for a site
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { t } from '../shared/i18n'
import {
  type ConditionalRule,
  ConditionType,
  createDefaultRule,
  getConditionDescription,
  getConditionTypes,
  validateConditionalRule,
} from '../shared/domain/conditional-rules'
import {
  HashIcon,
  TimerIcon,
  PlayIcon,
  PauseIcon,
  TrashIcon,
  XIcon,
} from '../shared/components/Icons'

interface ConditionalRulesModalProps {
  host: string
  initialRules: ConditionalRule[]
  onClose: () => void
  onSave: (rules: ConditionalRule[]) => void
}

const ConditionalRulesModal: React.FC<ConditionalRulesModalProps> = ({
  host,
  initialRules,
  onClose,
  onSave,
}) => {
  const [rules, setRules] = useState<ConditionalRule[]>(initialRules || [])

  const conditionTypes = getConditionTypes()

  const handleAddRule = (type: ConditionType) => {
    const newRule = createDefaultRule(type)
    setRules([...rules, newRule])
  }

  const handleRemoveRule = (index: number) => {
    const newRules = rules.filter((_, i) => i !== index)
    setRules(newRules)
  }

  const handleToggleRule = (index: number) => {
    const newRules = [...rules]
    newRules[index] = { ...newRules[index], enabled: !newRules[index].enabled }
    setRules(newRules)
  }

  const handleUpdateRule = (index: number, updates: Partial<ConditionalRule>) => {
    const newRules = [...rules]
    newRules[index] = { ...newRules[index], ...updates }
    setRules(newRules)
  }

  const handleSave = () => {
    // Validate all rules
    for (const rule of rules) {
      const validation = validateConditionalRule(rule)
      if (!validation.valid) {
        alert(t('conditionalRules.validationError', { error: validation.error || 'Unknown error' }))
        return
      }
    }

    onSave(rules)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-xl bg-washi rounded-xl shadow-[var(--shadow-lg)] overflow-hidden border border-border/60 flex flex-col max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-border/40 bg-white/50 backdrop-blur-sm flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-serif text-sumi-black tracking-tight">
              {t('conditionalRules.modalTitle')}
            </h2>
            <div className="text-xs font-mono text-sumi-gray mt-1 tracking-wider opacity-80">{host}</div>
          </div>
          <button
            className="p-2 rounded-full hover:bg-black/5 text-sumi-gray transition-colors hover:text-sumi-black hover:rotate-90 duration-300"
            onClick={onClose}
          >
            <XIcon size={20} strokeWidth={1.5} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="text-sm text-seiheki-blue mb-6 bg-seiheki-blue/10 p-4 rounded-xl border border-seiheki-blue/20 leading-relaxed font-light">
            {t('conditionalRules.description')}
          </div>

          {/* Existing Rules */}
          {rules.length > 0 && (
            <div className="space-y-4 mb-6">
              <AnimatePresence>
                {rules.map((rule, index) => (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    key={index}
                    className={`rounded-xl border overflow-hidden transition-all duration-300 ${rule.enabled ? 'bg-white/60 shadow-sm border-border/50' : 'bg-black/5 border-border/30 opacity-70'
                      }`}
                  >
                    <div className="p-5 flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="font-serif tracking-wide text-base mb-1 text-sumi-black flex items-center gap-3">
                          <span className={`${rule.enabled ? 'text-accent' : 'text-sumi-gray'}`}>
                            {rule.type === ConditionType.VISITS_PER_DAY ? (
                              <HashIcon size={18} strokeWidth={1.5} />
                            ) : (
                              <TimerIcon size={18} strokeWidth={1.5} />
                            )}
                          </span>
                          {conditionTypes.find(t => t.type === rule.type)?.name}
                        </div>
                        <div className="text-sm font-light text-sumi-gray leading-relaxed pl-7">
                          {getConditionDescription(rule)}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className={`p-2 rounded-lg text-sm border transition-all duration-200 ${rule.enabled ? 'border-border/80 text-sumi-gray hover:bg-black/5' : 'border-accent/40 bg-accent/5 text-accent hover:bg-accent hover:text-white'}`}
                          onClick={() => handleToggleRule(index)}
                        >
                          {rule.enabled ? <PauseIcon size={16} strokeWidth={1.5} /> : <PlayIcon size={16} strokeWidth={1.5} />}
                        </button>
                        <button
                          className="p-2 rounded-lg border border-danger/40 text-danger hover:bg-danger hover:text-white transition-all duration-200"
                          onClick={() => handleRemoveRule(index)}
                        >
                          <TrashIcon size={16} strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>

                    {/* Rule Configuration */}
                    {rule.enabled && (
                      <div className="px-5 pb-5 pt-0">
                        <div className="pt-4 mt-2 border-t border-border/40 pl-7">
                          {rule.type === ConditionType.VISITS_PER_DAY && (
                            <div className="flex items-center gap-4">
                              <label className="text-xs font-serif tracking-widest text-sumi-gray uppercase">
                                {t('conditionalRules.maxVisitsPerDay')}
                              </label>
                              <input
                                type="number"
                                className="w-24 px-3 py-1.5 text-sm font-mono shadow-inner rounded-md border border-border/80 bg-white focus:border-accent outline-none transition-colors"
                                min="1"
                                value={rule.maxVisits || 5}
                                onChange={e =>
                                  handleUpdateRule(index, {
                                    maxVisits: parseInt(e.target.value) || 5,
                                  })
                                }
                              />
                            </div>
                          )}

                          {rule.type === ConditionType.TIME_LIMIT && (
                            <div className="flex items-center gap-4">
                              <label className="text-xs font-serif tracking-widest text-sumi-gray uppercase">
                                {t('conditionalRules.maxTimeMinutesLabel')}
                              </label>
                              <input
                                type="number"
                                className="w-24 px-3 py-1.5 text-sm font-mono shadow-inner rounded-md border border-border/80 bg-white focus:border-accent outline-none transition-colors"
                                min="1"
                                value={rule.maxTimeMinutes || 30}
                                onChange={e =>
                                  handleUpdateRule(index, {
                                    maxTimeMinutes: parseInt(e.target.value) || 30,
                                  })
                                }
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Add Rule Buttons */}
          <div className="bg-white/40 shadow-sm p-5 rounded-xl border border-border/50">
            <label className="block mb-4 font-serif text-sm tracking-wide text-sumi-black">
              {t('conditionalRules.addCondition')}
            </label>
            <div className="flex gap-3 flex-wrap">
              {conditionTypes.map(type => (
                <button
                  key={type.type}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-white border border-border/80 text-sm font-medium hover:border-accent hover:text-accent shadow-sm hover:shadow transition-all duration-300 group"
                  onClick={() => handleAddRule(type.type)}
                  title={type.description}
                >
                  <span className="text-sumi-gray group-hover:text-accent transition-colors">
                    {type.type === ConditionType.VISITS_PER_DAY ? (
                      <HashIcon size={18} strokeWidth={1.5} />
                    ) : (
                      <TimerIcon size={18} strokeWidth={1.5} />
                    )}
                  </span>
                  {type.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="p-6 border-t border-border/40 bg-white/50 backdrop-blur-sm flex gap-4">
          <button
            className="flex-1 px-6 py-3 rounded-lg border border-border/80 bg-white text-sumi-black hover:bg-black/5 hover:border-sumi-gray transition-all shadow-sm font-medium"
            onClick={onClose}
          >
            {t('common.cancel')}
          </button>
          <button
            className="flex-1 px-6 py-3 rounded-lg bg-accent text-white hover:bg-accent2 transition-all shadow-md font-medium"
            onClick={handleSave}
          >
            {t('common.save')}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default ConditionalRulesModal
