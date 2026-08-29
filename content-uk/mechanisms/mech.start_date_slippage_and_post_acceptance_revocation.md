---
id: "mech.start_date_slippage_and_post_acceptance_revocation"
type: "mechanism"
aliases:
  - "M-027"
title: "Зсув дати виходу та скасування оферу після прийняття"
summary: "Роботодавці переносять підтверджені дати виходу або відкликають прийняті пропозиції між підписанням та першим днем через зміну бюджетних пріоритетів чи авторизації проєктів."
operates_at:
  - "bar.offer_closing_contract_execution"
  - "bar.probation_period_post_start_confirmation"
emissions:
  -
    artifact: "obs.offer_accepted_followed_by_delayed_start_date_or_post_signing_revocation"
    fidelity: "direct"
    likelihood: "high"
    evidence:
      - "evidence.probation_period_limits_and_dismissal_standards_ukraine_labour_code_art_26_28"
      - "evidence.statutory_notice_and_contractual_probation_parameters_uk_employment_rights_act_1996"
    observed_at:
      - "post-offer"
  -
    artifact: "obs.complete_silence_after_submission"
    fidelity: "void"
    likelihood: "medium"
    evidence: []
    observed_at:
      - "post-offer"
  -
    artifact: "obs.offer_rescinded_or_delayed_due_to_internal_freeze"
    fidelity: "euphemism"
    likelihood: "medium"
    evidence: []
    observed_at:
      - "post-offer"
facets:
  actor: "policy"
  nature: "incentive"
  visibility: "opaque"
  removability: "none"
amplifies: []
masks: []
honest_baseline: false
status: "active"
evidence_level: "established"
evidence_ids:
  - "evidence.probation_period_limits_and_dismissal_standards_ukraine_labour_code_art_26_28"
  - "evidence.statutory_notice_and_contractual_probation_parameters_uk_employment_rights_act_1996"
specimens:
  -
    kind: "email"
    label: "Повідомлення про перенесення дати виходу"
    lines:
      -
        text: "Ми завершуємо розподіл внутрішніх ресурсів і невдовзі підтвердимо оновлену дату виходу."
        tell: true
      -
        text: "Будь ласка, не виходьте в офіс до отримання підтвердженого графіка передачі техніки."
        tell: false
    reading: "Затримка дозволяє оптимізувати витрати компанії, перекладаючи фінансові ризики на працівника."
perspectives:
  -
    actor: "actor.employer_policy"
    sees: "Рішення про заморожування найму або перегляд бюджету, що набуває чинності до першого дня роботи."
    reads: "Зсув строків виходу дозволяє уникнути нарахування зарплати під час реорганізації штату."
    does: "Призупиняє процес онбордингу та розсилає стандартні заспокійливі повідомлення."
  -
    actor: "actor.candidate"
    sees: "Підписаний офер із невизначеною або відкладеною датою після звільнення з попередньої роботи."
    reads: "Зобов'язання виявилися асиметричними: звільнення є незворотним, а старт відкладається."
    does: "Оцінює правові можливості компенсації за британським Employment Rights Act 1996 та розглядає поновлення активного пошуку."
  -
    actor: "actor.recruiter"
    sees: "Закриту вакансію, яка зависає через неможливість призначити перший робочий день."
    reads: "Плани компанії змінилися після підписання оферу, заблокувавши результати найму."
    does: "Намагається підтримувати комунікацію з кандидатом, доки керівництво вирішує питання фінансування."
non_inferences:
  - "Не свідчить про проблеми з кваліфікацією кандидата або негативні результати перевірки."
---

# Зсув дати виходу та скасування оферу після прийняття

Роботодавці переносять підтверджені дати виходу або відкликають прийняті пропозиції між підписанням та першим днем через зміну бюджетних пріоритетів чи авторизації проєктів.

### Структурний контекст
- **Актор:** `policy`
- **Природа:** `incentive`
- **Усувність:** `none`

### Не-висновки
- Не свідчить про проблеми з кваліфікацією кандидата або негативні результати перевірки.
