// Lean compiler output
// Module: Hoba.Machine
// Imports: public import Init public meta import Init
#include <lean/lean.h>
#if defined(__clang__)
#pragma clang diagnostic ignored "-Wunused-parameter"
#pragma clang diagnostic ignored "-Wunused-label"
#elif defined(__GNUC__) && !defined(__CLANG__)
#pragma GCC diagnostic ignored "-Wunused-parameter"
#pragma GCC diagnostic ignored "-Wunused-label"
#pragma GCC diagnostic ignored "-Wunused-but-set-variable"
#endif
#ifdef __cplusplus
extern "C" {
#endif
lean_object* l_Nat_reprFast(lean_object*);
lean_object* l_List_reverse___redArg(lean_object*);
lean_object* l_Std_Format_joinSep___at___00Lean_Syntax_formatStxAux_spec__2(lean_object*, lean_object*);
lean_object* lean_string_length(lean_object*);
lean_object* lean_nat_to_int(lean_object*);
lean_object* l_Repr_addAppParen(lean_object*, lean_object*);
uint8_t lean_nat_dec_le(lean_object*, lean_object*);
uint8_t l_List_elem___at___00Lean_Meta_Occurrences_contains_spec__0(lean_object*, lean_object*);
lean_object* l_List_lengthTR___redArg(lean_object*);
lean_object* l_Std_Format_fill(lean_object*);
lean_object* lean_array_to_list(lean_object*);
lean_object* lean_mk_empty_array_with_capacity(lean_object*);
uint8_t lean_nat_dec_eq(lean_object*, lean_object*);
lean_object* lean_array_push(lean_object*, lean_object*);
lean_object* l_List_foldl___at___00Array_appendList_spec__0___redArg(lean_object*, lean_object*);
uint8_t lean_nat_dec_lt(lean_object*, lean_object*);
lean_object* l_List_appendTR___redArg(lean_object*, lean_object*);
lean_object* lean_nat_sub(lean_object*, lean_object*);
lean_object* l_List_range(lean_object*);
lean_object* l_List_getD___redArg(lean_object*, lean_object*, lean_object*);
uint8_t lean_nat_dec_le(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_hoba_Hoba_Kind_ctorIdx(uint8_t);
LEAN_EXPORT lean_object* lp_hoba_Hoba_Kind_ctorIdx___boxed(lean_object*);
LEAN_EXPORT lean_object* lp_hoba_Hoba_Kind_toCtorIdx(uint8_t);
LEAN_EXPORT lean_object* lp_hoba_Hoba_Kind_toCtorIdx___boxed(lean_object*);
LEAN_EXPORT lean_object* lp_hoba_Hoba_Kind_ctorElim___redArg(lean_object*);
LEAN_EXPORT lean_object* lp_hoba_Hoba_Kind_ctorElim___redArg___boxed(lean_object*);
LEAN_EXPORT lean_object* lp_hoba_Hoba_Kind_ctorElim(lean_object*, lean_object*, uint8_t, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_hoba_Hoba_Kind_ctorElim___boxed(lean_object*, lean_object*, lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_hoba_Hoba_Kind_initial_elim___redArg(lean_object*);
LEAN_EXPORT lean_object* lp_hoba_Hoba_Kind_initial_elim___redArg___boxed(lean_object*);
LEAN_EXPORT lean_object* lp_hoba_Hoba_Kind_initial_elim(lean_object*, uint8_t, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_hoba_Hoba_Kind_initial_elim___boxed(lean_object*, lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_hoba_Hoba_Kind_active_elim___redArg(lean_object*);
LEAN_EXPORT lean_object* lp_hoba_Hoba_Kind_active_elim___redArg___boxed(lean_object*);
LEAN_EXPORT lean_object* lp_hoba_Hoba_Kind_active_elim(lean_object*, uint8_t, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_hoba_Hoba_Kind_active_elim___boxed(lean_object*, lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_hoba_Hoba_Kind_terminal_elim___redArg(lean_object*);
LEAN_EXPORT lean_object* lp_hoba_Hoba_Kind_terminal_elim___redArg___boxed(lean_object*);
LEAN_EXPORT lean_object* lp_hoba_Hoba_Kind_terminal_elim(lean_object*, uint8_t, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_hoba_Hoba_Kind_terminal_elim___boxed(lean_object*, lean_object*, lean_object*, lean_object*);
LEAN_EXPORT uint8_t lp_hoba_Hoba_Kind_ofNat(lean_object*);
LEAN_EXPORT lean_object* lp_hoba_Hoba_Kind_ofNat___boxed(lean_object*);
LEAN_EXPORT uint8_t lp_hoba_Hoba_instDecidableEqKind(uint8_t, uint8_t);
LEAN_EXPORT lean_object* lp_hoba_Hoba_instDecidableEqKind___boxed(lean_object*, lean_object*);
static const lean_string_object lp_hoba_Hoba_instReprKind_repr___closed__0_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 18, .m_capacity = 18, .m_length = 17, .m_data = "Hoba.Kind.initial"};
static const lean_object* lp_hoba_Hoba_instReprKind_repr___closed__0 = (const lean_object*)&lp_hoba_Hoba_instReprKind_repr___closed__0_value;
static const lean_ctor_object lp_hoba_Hoba_instReprKind_repr___closed__1_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_hoba_Hoba_instReprKind_repr___closed__0_value)}};
static const lean_object* lp_hoba_Hoba_instReprKind_repr___closed__1 = (const lean_object*)&lp_hoba_Hoba_instReprKind_repr___closed__1_value;
static const lean_string_object lp_hoba_Hoba_instReprKind_repr___closed__2_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 17, .m_capacity = 17, .m_length = 16, .m_data = "Hoba.Kind.active"};
static const lean_object* lp_hoba_Hoba_instReprKind_repr___closed__2 = (const lean_object*)&lp_hoba_Hoba_instReprKind_repr___closed__2_value;
static const lean_ctor_object lp_hoba_Hoba_instReprKind_repr___closed__3_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_hoba_Hoba_instReprKind_repr___closed__2_value)}};
static const lean_object* lp_hoba_Hoba_instReprKind_repr___closed__3 = (const lean_object*)&lp_hoba_Hoba_instReprKind_repr___closed__3_value;
static const lean_string_object lp_hoba_Hoba_instReprKind_repr___closed__4_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 19, .m_capacity = 19, .m_length = 18, .m_data = "Hoba.Kind.terminal"};
static const lean_object* lp_hoba_Hoba_instReprKind_repr___closed__4 = (const lean_object*)&lp_hoba_Hoba_instReprKind_repr___closed__4_value;
static const lean_ctor_object lp_hoba_Hoba_instReprKind_repr___closed__5_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_hoba_Hoba_instReprKind_repr___closed__4_value)}};
static const lean_object* lp_hoba_Hoba_instReprKind_repr___closed__5 = (const lean_object*)&lp_hoba_Hoba_instReprKind_repr___closed__5_value;
static lean_once_cell_t lp_hoba_Hoba_instReprKind_repr___closed__6_once = LEAN_ONCE_CELL_INITIALIZER;
static lean_object* lp_hoba_Hoba_instReprKind_repr___closed__6;
static lean_once_cell_t lp_hoba_Hoba_instReprKind_repr___closed__7_once = LEAN_ONCE_CELL_INITIALIZER;
static lean_object* lp_hoba_Hoba_instReprKind_repr___closed__7;
LEAN_EXPORT lean_object* lp_hoba_Hoba_instReprKind_repr(uint8_t, lean_object*);
LEAN_EXPORT lean_object* lp_hoba_Hoba_instReprKind_repr___boxed(lean_object*, lean_object*);
static const lean_closure_object lp_hoba_Hoba_instReprKind___closed__0_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_closure_object) + sizeof(void*)*0, .m_other = 0, .m_tag = 245}, .m_fun = (void*)lp_hoba_Hoba_instReprKind_repr___boxed, .m_arity = 2, .m_num_fixed = 0, .m_objs = {} };
static const lean_object* lp_hoba_Hoba_instReprKind___closed__0 = (const lean_object*)&lp_hoba_Hoba_instReprKind___closed__0_value;
LEAN_EXPORT const lean_object* lp_hoba_Hoba_instReprKind = (const lean_object*)&lp_hoba_Hoba_instReprKind___closed__0_value;
LEAN_EXPORT uint8_t lp_hoba_Hoba_instInhabitedKind_default;
LEAN_EXPORT uint8_t lp_hoba_Hoba_instInhabitedKind;
LEAN_EXPORT lean_object* lp_hoba_List_foldl___at___00List_foldl___at___00Std_Format_joinSep___at___00List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3_spec__7_spec__11_spec__15(lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_hoba_List_foldl___at___00Std_Format_joinSep___at___00List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3_spec__7_spec__11(lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_hoba_Std_Format_joinSep___at___00List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3_spec__7___lam__0(lean_object*);
LEAN_EXPORT lean_object* lp_hoba_Std_Format_joinSep___at___00List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3_spec__7(lean_object*, lean_object*);
static const lean_string_object lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__0_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 3, .m_capacity = 3, .m_length = 2, .m_data = "[]"};
static const lean_object* lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__0 = (const lean_object*)&lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__0_value;
static const lean_ctor_object lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__1_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__0_value)}};
static const lean_object* lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__1 = (const lean_object*)&lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__1_value;
static const lean_string_object lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__2_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 2, .m_capacity = 2, .m_length = 1, .m_data = "["};
static const lean_object* lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__2 = (const lean_object*)&lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__2_value;
static const lean_string_object lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__3_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 2, .m_capacity = 2, .m_length = 1, .m_data = ","};
static const lean_object* lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__3 = (const lean_object*)&lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__3_value;
static const lean_ctor_object lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__4_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__3_value)}};
static const lean_object* lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__4 = (const lean_object*)&lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__4_value;
static const lean_ctor_object lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__5_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*2 + 0, .m_other = 2, .m_tag = 5}, .m_objs = {((lean_object*)&lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__4_value),((lean_object*)(((size_t)(1) << 1) | 1))}};
static const lean_object* lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__5 = (const lean_object*)&lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__5_value;
static const lean_string_object lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__6_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 2, .m_capacity = 2, .m_length = 1, .m_data = "]"};
static const lean_object* lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__6 = (const lean_object*)&lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__6_value;
static lean_once_cell_t lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__7_once = LEAN_ONCE_CELL_INITIALIZER;
static lean_object* lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__7;
static lean_once_cell_t lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__8_once = LEAN_ONCE_CELL_INITIALIZER;
static lean_object* lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__8;
static const lean_ctor_object lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__9_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__2_value)}};
static const lean_object* lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__9 = (const lean_object*)&lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__9_value;
static const lean_ctor_object lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__10_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__6_value)}};
static const lean_object* lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__10 = (const lean_object*)&lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__10_value;
LEAN_EXPORT lean_object* lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg(lean_object*);
LEAN_EXPORT lean_object* lp_hoba_List_foldl___at___00List_foldl___at___00Std_Format_joinSep___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__1_spec__2_spec__4_spec__8(lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_hoba_List_foldl___at___00Std_Format_joinSep___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__1_spec__2_spec__4(lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_hoba_Std_Format_joinSep___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__1_spec__2(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_hoba_List_repr___at___00Hoba_instReprMachine_repr_spec__1___redArg(lean_object*);
static const lean_string_object lp_hoba_Prod_repr___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__2_spec__4___redArg___closed__0_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 2, .m_capacity = 2, .m_length = 1, .m_data = "("};
static const lean_object* lp_hoba_Prod_repr___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__2_spec__4___redArg___closed__0 = (const lean_object*)&lp_hoba_Prod_repr___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__2_spec__4___redArg___closed__0_value;
static const lean_string_object lp_hoba_Prod_repr___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__2_spec__4___redArg___closed__1_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 2, .m_capacity = 2, .m_length = 1, .m_data = ")"};
static const lean_object* lp_hoba_Prod_repr___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__2_spec__4___redArg___closed__1 = (const lean_object*)&lp_hoba_Prod_repr___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__2_spec__4___redArg___closed__1_value;
static lean_once_cell_t lp_hoba_Prod_repr___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__2_spec__4___redArg___closed__2_once = LEAN_ONCE_CELL_INITIALIZER;
static lean_object* lp_hoba_Prod_repr___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__2_spec__4___redArg___closed__2;
static lean_once_cell_t lp_hoba_Prod_repr___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__2_spec__4___redArg___closed__3_once = LEAN_ONCE_CELL_INITIALIZER;
static lean_object* lp_hoba_Prod_repr___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__2_spec__4___redArg___closed__3;
static const lean_ctor_object lp_hoba_Prod_repr___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__2_spec__4___redArg___closed__4_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_hoba_Prod_repr___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__2_spec__4___redArg___closed__0_value)}};
static const lean_object* lp_hoba_Prod_repr___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__2_spec__4___redArg___closed__4 = (const lean_object*)&lp_hoba_Prod_repr___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__2_spec__4___redArg___closed__4_value;
static const lean_ctor_object lp_hoba_Prod_repr___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__2_spec__4___redArg___closed__5_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_hoba_Prod_repr___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__2_spec__4___redArg___closed__1_value)}};
static const lean_object* lp_hoba_Prod_repr___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__2_spec__4___redArg___closed__5 = (const lean_object*)&lp_hoba_Prod_repr___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__2_spec__4___redArg___closed__5_value;
LEAN_EXPORT lean_object* lp_hoba_Prod_repr___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__2_spec__4___redArg(lean_object*);
LEAN_EXPORT lean_object* lp_hoba_List_foldl___at___00List_foldl___at___00Std_Format_joinSep___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__2_spec__5_spec__8_spec__12(lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_hoba_List_foldl___at___00Std_Format_joinSep___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__2_spec__5_spec__8(lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_hoba_Std_Format_joinSep___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__2_spec__5(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_hoba_List_repr___at___00Hoba_instReprMachine_repr_spec__2___redArg(lean_object*);
LEAN_EXPORT lean_object* lp_hoba_Std_Format_joinSep___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__0_spec__0___lam__0(uint8_t);
LEAN_EXPORT lean_object* lp_hoba_Std_Format_joinSep___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__0_spec__0___lam__0___boxed(lean_object*);
LEAN_EXPORT lean_object* lp_hoba_List_foldl___at___00List_foldl___at___00Std_Format_joinSep___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__0_spec__0_spec__1_spec__5(lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_hoba_List_foldl___at___00Std_Format_joinSep___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__0_spec__0_spec__1(lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_hoba_Std_Format_joinSep___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__0_spec__0(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_hoba_List_repr___at___00Hoba_instReprMachine_repr_spec__0___redArg(lean_object*);
static const lean_string_object lp_hoba_Hoba_instReprMachine_repr___redArg___closed__0_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 3, .m_capacity = 3, .m_length = 2, .m_data = "{ "};
static const lean_object* lp_hoba_Hoba_instReprMachine_repr___redArg___closed__0 = (const lean_object*)&lp_hoba_Hoba_instReprMachine_repr___redArg___closed__0_value;
static const lean_string_object lp_hoba_Hoba_instReprMachine_repr___redArg___closed__1_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 2, .m_capacity = 2, .m_length = 1, .m_data = "n"};
static const lean_object* lp_hoba_Hoba_instReprMachine_repr___redArg___closed__1 = (const lean_object*)&lp_hoba_Hoba_instReprMachine_repr___redArg___closed__1_value;
static const lean_ctor_object lp_hoba_Hoba_instReprMachine_repr___redArg___closed__2_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_hoba_Hoba_instReprMachine_repr___redArg___closed__1_value)}};
static const lean_object* lp_hoba_Hoba_instReprMachine_repr___redArg___closed__2 = (const lean_object*)&lp_hoba_Hoba_instReprMachine_repr___redArg___closed__2_value;
static const lean_ctor_object lp_hoba_Hoba_instReprMachine_repr___redArg___closed__3_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*2 + 0, .m_other = 2, .m_tag = 5}, .m_objs = {((lean_object*)(((size_t)(0) << 1) | 1)),((lean_object*)&lp_hoba_Hoba_instReprMachine_repr___redArg___closed__2_value)}};
static const lean_object* lp_hoba_Hoba_instReprMachine_repr___redArg___closed__3 = (const lean_object*)&lp_hoba_Hoba_instReprMachine_repr___redArg___closed__3_value;
static const lean_string_object lp_hoba_Hoba_instReprMachine_repr___redArg___closed__4_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 5, .m_capacity = 5, .m_length = 4, .m_data = " := "};
static const lean_object* lp_hoba_Hoba_instReprMachine_repr___redArg___closed__4 = (const lean_object*)&lp_hoba_Hoba_instReprMachine_repr___redArg___closed__4_value;
static const lean_ctor_object lp_hoba_Hoba_instReprMachine_repr___redArg___closed__5_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_hoba_Hoba_instReprMachine_repr___redArg___closed__4_value)}};
static const lean_object* lp_hoba_Hoba_instReprMachine_repr___redArg___closed__5 = (const lean_object*)&lp_hoba_Hoba_instReprMachine_repr___redArg___closed__5_value;
static const lean_ctor_object lp_hoba_Hoba_instReprMachine_repr___redArg___closed__6_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*2 + 0, .m_other = 2, .m_tag = 5}, .m_objs = {((lean_object*)&lp_hoba_Hoba_instReprMachine_repr___redArg___closed__3_value),((lean_object*)&lp_hoba_Hoba_instReprMachine_repr___redArg___closed__5_value)}};
static const lean_object* lp_hoba_Hoba_instReprMachine_repr___redArg___closed__6 = (const lean_object*)&lp_hoba_Hoba_instReprMachine_repr___redArg___closed__6_value;
static lean_once_cell_t lp_hoba_Hoba_instReprMachine_repr___redArg___closed__7_once = LEAN_ONCE_CELL_INITIALIZER;
static lean_object* lp_hoba_Hoba_instReprMachine_repr___redArg___closed__7;
static const lean_string_object lp_hoba_Hoba_instReprMachine_repr___redArg___closed__8_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 5, .m_capacity = 5, .m_length = 4, .m_data = "kind"};
static const lean_object* lp_hoba_Hoba_instReprMachine_repr___redArg___closed__8 = (const lean_object*)&lp_hoba_Hoba_instReprMachine_repr___redArg___closed__8_value;
static const lean_ctor_object lp_hoba_Hoba_instReprMachine_repr___redArg___closed__9_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_hoba_Hoba_instReprMachine_repr___redArg___closed__8_value)}};
static const lean_object* lp_hoba_Hoba_instReprMachine_repr___redArg___closed__9 = (const lean_object*)&lp_hoba_Hoba_instReprMachine_repr___redArg___closed__9_value;
static lean_once_cell_t lp_hoba_Hoba_instReprMachine_repr___redArg___closed__10_once = LEAN_ONCE_CELL_INITIALIZER;
static lean_object* lp_hoba_Hoba_instReprMachine_repr___redArg___closed__10;
static const lean_string_object lp_hoba_Hoba_instReprMachine_repr___redArg___closed__11_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 11, .m_capacity = 11, .m_length = 10, .m_data = "deviations"};
static const lean_object* lp_hoba_Hoba_instReprMachine_repr___redArg___closed__11 = (const lean_object*)&lp_hoba_Hoba_instReprMachine_repr___redArg___closed__11_value;
static const lean_ctor_object lp_hoba_Hoba_instReprMachine_repr___redArg___closed__12_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_hoba_Hoba_instReprMachine_repr___redArg___closed__11_value)}};
static const lean_object* lp_hoba_Hoba_instReprMachine_repr___redArg___closed__12 = (const lean_object*)&lp_hoba_Hoba_instReprMachine_repr___redArg___closed__12_value;
static lean_once_cell_t lp_hoba_Hoba_instReprMachine_repr___redArg___closed__13_once = LEAN_ONCE_CELL_INITIALIZER;
static lean_object* lp_hoba_Hoba_instReprMachine_repr___redArg___closed__13;
static const lean_string_object lp_hoba_Hoba_instReprMachine_repr___redArg___closed__14_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 6, .m_capacity = 6, .m_length = 5, .m_data = "edges"};
static const lean_object* lp_hoba_Hoba_instReprMachine_repr___redArg___closed__14 = (const lean_object*)&lp_hoba_Hoba_instReprMachine_repr___redArg___closed__14_value;
static const lean_ctor_object lp_hoba_Hoba_instReprMachine_repr___redArg___closed__15_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_hoba_Hoba_instReprMachine_repr___redArg___closed__14_value)}};
static const lean_object* lp_hoba_Hoba_instReprMachine_repr___redArg___closed__15 = (const lean_object*)&lp_hoba_Hoba_instReprMachine_repr___redArg___closed__15_value;
static lean_once_cell_t lp_hoba_Hoba_instReprMachine_repr___redArg___closed__16_once = LEAN_ONCE_CELL_INITIALIZER;
static lean_object* lp_hoba_Hoba_instReprMachine_repr___redArg___closed__16;
static const lean_string_object lp_hoba_Hoba_instReprMachine_repr___redArg___closed__17_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 5, .m_capacity = 5, .m_length = 4, .m_data = "rank"};
static const lean_object* lp_hoba_Hoba_instReprMachine_repr___redArg___closed__17 = (const lean_object*)&lp_hoba_Hoba_instReprMachine_repr___redArg___closed__17_value;
static const lean_ctor_object lp_hoba_Hoba_instReprMachine_repr___redArg___closed__18_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_hoba_Hoba_instReprMachine_repr___redArg___closed__17_value)}};
static const lean_object* lp_hoba_Hoba_instReprMachine_repr___redArg___closed__18 = (const lean_object*)&lp_hoba_Hoba_instReprMachine_repr___redArg___closed__18_value;
static const lean_string_object lp_hoba_Hoba_instReprMachine_repr___redArg___closed__19_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 3, .m_capacity = 3, .m_length = 2, .m_data = " }"};
static const lean_object* lp_hoba_Hoba_instReprMachine_repr___redArg___closed__19 = (const lean_object*)&lp_hoba_Hoba_instReprMachine_repr___redArg___closed__19_value;
static lean_once_cell_t lp_hoba_Hoba_instReprMachine_repr___redArg___closed__20_once = LEAN_ONCE_CELL_INITIALIZER;
static lean_object* lp_hoba_Hoba_instReprMachine_repr___redArg___closed__20;
static lean_once_cell_t lp_hoba_Hoba_instReprMachine_repr___redArg___closed__21_once = LEAN_ONCE_CELL_INITIALIZER;
static lean_object* lp_hoba_Hoba_instReprMachine_repr___redArg___closed__21;
static const lean_ctor_object lp_hoba_Hoba_instReprMachine_repr___redArg___closed__22_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_hoba_Hoba_instReprMachine_repr___redArg___closed__0_value)}};
static const lean_object* lp_hoba_Hoba_instReprMachine_repr___redArg___closed__22 = (const lean_object*)&lp_hoba_Hoba_instReprMachine_repr___redArg___closed__22_value;
static const lean_ctor_object lp_hoba_Hoba_instReprMachine_repr___redArg___closed__23_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_hoba_Hoba_instReprMachine_repr___redArg___closed__19_value)}};
static const lean_object* lp_hoba_Hoba_instReprMachine_repr___redArg___closed__23 = (const lean_object*)&lp_hoba_Hoba_instReprMachine_repr___redArg___closed__23_value;
LEAN_EXPORT lean_object* lp_hoba_Hoba_instReprMachine_repr___redArg(lean_object*);
LEAN_EXPORT lean_object* lp_hoba_Hoba_instReprMachine_repr(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_hoba_Hoba_instReprMachine_repr___boxed(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_hoba_List_repr___at___00Hoba_instReprMachine_repr_spec__0(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_hoba_List_repr___at___00Hoba_instReprMachine_repr_spec__0___boxed(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_hoba_List_repr___at___00Hoba_instReprMachine_repr_spec__1(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_hoba_List_repr___at___00Hoba_instReprMachine_repr_spec__1___boxed(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_hoba_List_repr___at___00Hoba_instReprMachine_repr_spec__2(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_hoba_List_repr___at___00Hoba_instReprMachine_repr_spec__2___boxed(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___boxed(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_hoba_Prod_repr___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__2_spec__4(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_hoba_Prod_repr___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__2_spec__4___boxed(lean_object*, lean_object*);
static const lean_closure_object lp_hoba_Hoba_instReprMachine___closed__0_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_closure_object) + sizeof(void*)*0, .m_other = 0, .m_tag = 245}, .m_fun = (void*)lp_hoba_Hoba_instReprMachine_repr___boxed, .m_arity = 2, .m_num_fixed = 0, .m_objs = {} };
static const lean_object* lp_hoba_Hoba_instReprMachine___closed__0 = (const lean_object*)&lp_hoba_Hoba_instReprMachine___closed__0_value;
LEAN_EXPORT const lean_object* lp_hoba_Hoba_instReprMachine = (const lean_object*)&lp_hoba_Hoba_instReprMachine___closed__0_value;
static const lean_string_object lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__0_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 15, .m_capacity = 15, .m_length = 14, .m_data = "conditionCount"};
static const lean_object* lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__0 = (const lean_object*)&lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__0_value;
static const lean_ctor_object lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__1_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__0_value)}};
static const lean_object* lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__1 = (const lean_object*)&lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__1_value;
static const lean_ctor_object lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__2_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*2 + 0, .m_other = 2, .m_tag = 5}, .m_objs = {((lean_object*)(((size_t)(0) << 1) | 1)),((lean_object*)&lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__1_value)}};
static const lean_object* lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__2 = (const lean_object*)&lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__2_value;
static const lean_ctor_object lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__3_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*2 + 0, .m_other = 2, .m_tag = 5}, .m_objs = {((lean_object*)&lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__2_value),((lean_object*)&lp_hoba_Hoba_instReprMachine_repr___redArg___closed__5_value)}};
static const lean_object* lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__3 = (const lean_object*)&lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__3_value;
static lean_once_cell_t lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__4_once = LEAN_ONCE_CELL_INITIALIZER;
static lean_object* lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__4;
static const lean_string_object lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__5_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 13, .m_capacity = 13, .m_length = 12, .m_data = "processCount"};
static const lean_object* lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__5 = (const lean_object*)&lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__5_value;
static const lean_ctor_object lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__6_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__5_value)}};
static const lean_object* lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__6 = (const lean_object*)&lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__6_value;
static lean_once_cell_t lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__7_once = LEAN_ONCE_CELL_INITIALIZER;
static lean_object* lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__7;
static const lean_string_object lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__8_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 12, .m_capacity = 12, .m_length = 11, .m_data = "recordCount"};
static const lean_object* lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__8 = (const lean_object*)&lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__8_value;
static const lean_ctor_object lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__9_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__8_value)}};
static const lean_object* lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__9 = (const lean_object*)&lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__9_value;
static lean_once_cell_t lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__10_once = LEAN_ONCE_CELL_INITIALIZER;
static lean_object* lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__10;
static const lean_string_object lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__11_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 10, .m_capacity = 10, .m_length = 9, .m_data = "flowCount"};
static const lean_object* lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__11 = (const lean_object*)&lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__11_value;
static const lean_ctor_object lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__12_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__11_value)}};
static const lean_object* lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__12 = (const lean_object*)&lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__12_value;
static lean_once_cell_t lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__13_once = LEAN_ONCE_CELL_INITIALIZER;
static lean_object* lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__13;
static const lean_string_object lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__14_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 22, .m_capacity = 22, .m_length = 21, .m_data = "barrierConditionCount"};
static const lean_object* lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__14 = (const lean_object*)&lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__14_value;
static const lean_ctor_object lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__15_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__14_value)}};
static const lean_object* lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__15 = (const lean_object*)&lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__15_value;
static lean_once_cell_t lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__16_once = LEAN_ONCE_CELL_INITIALIZER;
static lean_object* lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__16;
static const lean_string_object lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__17_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 24, .m_capacity = 24, .m_length = 23, .m_data = "mechanismConditionCount"};
static const lean_object* lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__17 = (const lean_object*)&lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__17_value;
static const lean_ctor_object lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__18_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__17_value)}};
static const lean_object* lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__18 = (const lean_object*)&lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__18_value;
static lean_once_cell_t lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__19_once = LEAN_ONCE_CELL_INITIALIZER;
static lean_object* lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__19;
static const lean_string_object lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__20_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 16, .m_capacity = 16, .m_length = 15, .m_data = "eventClassCount"};
static const lean_object* lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__20 = (const lean_object*)&lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__20_value;
static const lean_ctor_object lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__21_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__20_value)}};
static const lean_object* lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__21 = (const lean_object*)&lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__21_value;
static lean_once_cell_t lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__22_once = LEAN_ONCE_CELL_INITIALIZER;
static lean_object* lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__22;
LEAN_EXPORT lean_object* lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg(lean_object*);
LEAN_EXPORT lean_object* lp_hoba_Hoba_instReprSubstrateSummary_repr(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_hoba_Hoba_instReprSubstrateSummary_repr___boxed(lean_object*, lean_object*);
static const lean_closure_object lp_hoba_Hoba_instReprSubstrateSummary___closed__0_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_closure_object) + sizeof(void*)*0, .m_other = 0, .m_tag = 245}, .m_fun = (void*)lp_hoba_Hoba_instReprSubstrateSummary_repr___boxed, .m_arity = 2, .m_num_fixed = 0, .m_objs = {} };
static const lean_object* lp_hoba_Hoba_instReprSubstrateSummary___closed__0 = (const lean_object*)&lp_hoba_Hoba_instReprSubstrateSummary___closed__0_value;
LEAN_EXPORT const lean_object* lp_hoba_Hoba_instReprSubstrateSummary = (const lean_object*)&lp_hoba_Hoba_instReprSubstrateSummary___closed__0_value;
LEAN_EXPORT lean_object* lp_hoba_Hoba_Machine_rankOf(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_hoba_Hoba_Machine_rankOf___boxed(lean_object*, lean_object*);
LEAN_EXPORT uint8_t lp_hoba_Hoba_Machine_kindOf(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_hoba_Hoba_Machine_kindOf___boxed(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_hoba_Hoba_Machine_states(lean_object*);
LEAN_EXPORT lean_object* lp_hoba_List_filterMapTR_go___at___00Hoba_Machine_exits_spec__0(lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_hoba_List_filterMapTR_go___at___00Hoba_Machine_exits_spec__0___boxed(lean_object*, lean_object*, lean_object*);
static const lean_array_object lp_hoba_Hoba_Machine_exits___closed__0_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_array_object) + sizeof(void*)*0, .m_other = 0, .m_tag = 246}, .m_size = 0, .m_capacity = 0, .m_data = {}};
static const lean_object* lp_hoba_Hoba_Machine_exits___closed__0 = (const lean_object*)&lp_hoba_Hoba_Machine_exits___closed__0_value;
LEAN_EXPORT lean_object* lp_hoba_Hoba_Machine_exits(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_hoba_Hoba_Machine_exits___boxed(lean_object*, lean_object*);
LEAN_EXPORT uint8_t lp_hoba_List_all___at___00Hoba_Machine_WellFormed_spec__0(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_hoba_List_all___at___00Hoba_Machine_WellFormed_spec__0___boxed(lean_object*, lean_object*);
LEAN_EXPORT uint8_t lp_hoba_Hoba_Machine_WellFormed(lean_object*);
LEAN_EXPORT lean_object* lp_hoba_Hoba_Machine_WellFormed___boxed(lean_object*);
LEAN_EXPORT uint8_t lp_hoba_List_all___at___00Hoba_Machine_Forward_spec__0(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_hoba_List_all___at___00Hoba_Machine_Forward_spec__0___boxed(lean_object*, lean_object*);
LEAN_EXPORT uint8_t lp_hoba_Hoba_Machine_Forward(lean_object*);
LEAN_EXPORT lean_object* lp_hoba_Hoba_Machine_Forward___boxed(lean_object*);
LEAN_EXPORT uint8_t lp_hoba_List_any___at___00Hoba_Machine_NoDeadEnds_spec__0(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_hoba_List_any___at___00Hoba_Machine_NoDeadEnds_spec__0___boxed(lean_object*, lean_object*);
LEAN_EXPORT uint8_t lp_hoba_List_all___at___00Hoba_Machine_NoDeadEnds_spec__1(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_hoba_List_all___at___00Hoba_Machine_NoDeadEnds_spec__1___boxed(lean_object*, lean_object*);
LEAN_EXPORT uint8_t lp_hoba_Hoba_Machine_NoDeadEnds(lean_object*);
LEAN_EXPORT lean_object* lp_hoba_Hoba_Machine_NoDeadEnds___boxed(lean_object*);
LEAN_EXPORT lean_object* lp_hoba_List_filterTR_loop___at___00Hoba_Machine_homesFor_spec__0(lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_hoba_List_filterTR_loop___at___00Hoba_Machine_homesFor_spec__0___boxed(lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_hoba_Hoba_Machine_homesFor(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_hoba_Hoba_Machine_homesFor___boxed(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_hoba___private_Hoba_Machine_0__Hoba_Machine_absorb(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_hoba___private_Init_Data_List_Impl_0__List_flatMapTR_go___at___00__private_Hoba_Machine_0__Hoba_Machine_grow_spec__0(lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_hoba___private_Init_Data_List_Impl_0__List_flatMapTR_go___at___00__private_Hoba_Machine_0__Hoba_Machine_grow_spec__0___boxed(lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_hoba___private_Hoba_Machine_0__Hoba_Machine_grow(lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_hoba_Hoba_Machine_reachable(lean_object*, lean_object*);
LEAN_EXPORT uint8_t lp_hoba_List_all___at___00Hoba_Machine_AllReachable_spec__0(lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_hoba_List_all___at___00Hoba_Machine_AllReachable_spec__0___boxed(lean_object*, lean_object*, lean_object*);
LEAN_EXPORT uint8_t lp_hoba_Hoba_Machine_AllReachable(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_hoba_Hoba_Machine_AllReachable___boxed(lean_object*, lean_object*);
LEAN_EXPORT uint8_t lp_hoba_List_elem___at___00Hoba_Machine_Chain_spec__0(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_hoba_List_elem___at___00Hoba_Machine_Chain_spec__0___boxed(lean_object*, lean_object*);
LEAN_EXPORT uint8_t lp_hoba_Hoba_Machine_Chain(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_hoba_Hoba_Machine_Chain___boxed(lean_object*, lean_object*);
LEAN_EXPORT uint8_t lp_hoba_Hoba_Machine_IsCycle(lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_hoba_Hoba_Machine_IsCycle___boxed(lean_object*, lean_object*, lean_object*);
LEAN_EXPORT uint8_t lp_hoba_Hoba_Machine_Climbs(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_hoba_Hoba_Machine_Climbs___boxed(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_hoba___private_Hoba_Machine_0__Hoba_Machine_Chain_match__1_splitter___redArg(lean_object*, lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_hoba___private_Hoba_Machine_0__Hoba_Machine_Chain_match__1_splitter(lean_object*, lean_object*, lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_hoba___private_Hoba_Machine_0__Hoba_Machine_Climbs_match__1_splitter___redArg(lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_hoba___private_Hoba_Machine_0__Hoba_Machine_Climbs_match__1_splitter(lean_object*, lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_hoba_Hoba_Kind_ctorIdx(uint8_t v_x_1_){
_start:
{
switch(v_x_1_)
{
case 0:
{
lean_object* v___x_2_; 
v___x_2_ = lean_unsigned_to_nat(0u);
return v___x_2_;
}
case 1:
{
lean_object* v___x_3_; 
v___x_3_ = lean_unsigned_to_nat(1u);
return v___x_3_;
}
default: 
{
lean_object* v___x_4_; 
v___x_4_ = lean_unsigned_to_nat(2u);
return v___x_4_;
}
}
}
}
LEAN_EXPORT lean_object* lp_hoba_Hoba_Kind_ctorIdx___boxed(lean_object* v_x_5_){
_start:
{
uint8_t v_x_boxed_6_; lean_object* v_res_7_; 
v_x_boxed_6_ = lean_unbox(v_x_5_);
v_res_7_ = lp_hoba_Hoba_Kind_ctorIdx(v_x_boxed_6_);
return v_res_7_;
}
}
LEAN_EXPORT lean_object* lp_hoba_Hoba_Kind_toCtorIdx(uint8_t v_x_8_){
_start:
{
lean_object* v___x_9_; 
v___x_9_ = lp_hoba_Hoba_Kind_ctorIdx(v_x_8_);
return v___x_9_;
}
}
LEAN_EXPORT lean_object* lp_hoba_Hoba_Kind_toCtorIdx___boxed(lean_object* v_x_10_){
_start:
{
uint8_t v_x_4__boxed_11_; lean_object* v_res_12_; 
v_x_4__boxed_11_ = lean_unbox(v_x_10_);
v_res_12_ = lp_hoba_Hoba_Kind_toCtorIdx(v_x_4__boxed_11_);
return v_res_12_;
}
}
LEAN_EXPORT lean_object* lp_hoba_Hoba_Kind_ctorElim___redArg(lean_object* v_k_13_){
_start:
{
lean_inc(v_k_13_);
return v_k_13_;
}
}
LEAN_EXPORT lean_object* lp_hoba_Hoba_Kind_ctorElim___redArg___boxed(lean_object* v_k_14_){
_start:
{
lean_object* v_res_15_; 
v_res_15_ = lp_hoba_Hoba_Kind_ctorElim___redArg(v_k_14_);
lean_dec(v_k_14_);
return v_res_15_;
}
}
LEAN_EXPORT lean_object* lp_hoba_Hoba_Kind_ctorElim(lean_object* v_motive_16_, lean_object* v_ctorIdx_17_, uint8_t v_t_18_, lean_object* v_h_19_, lean_object* v_k_20_){
_start:
{
lean_inc(v_k_20_);
return v_k_20_;
}
}
LEAN_EXPORT lean_object* lp_hoba_Hoba_Kind_ctorElim___boxed(lean_object* v_motive_21_, lean_object* v_ctorIdx_22_, lean_object* v_t_23_, lean_object* v_h_24_, lean_object* v_k_25_){
_start:
{
uint8_t v_t_boxed_26_; lean_object* v_res_27_; 
v_t_boxed_26_ = lean_unbox(v_t_23_);
v_res_27_ = lp_hoba_Hoba_Kind_ctorElim(v_motive_21_, v_ctorIdx_22_, v_t_boxed_26_, v_h_24_, v_k_25_);
lean_dec(v_k_25_);
lean_dec(v_ctorIdx_22_);
return v_res_27_;
}
}
LEAN_EXPORT lean_object* lp_hoba_Hoba_Kind_initial_elim___redArg(lean_object* v_initial_28_){
_start:
{
lean_inc(v_initial_28_);
return v_initial_28_;
}
}
LEAN_EXPORT lean_object* lp_hoba_Hoba_Kind_initial_elim___redArg___boxed(lean_object* v_initial_29_){
_start:
{
lean_object* v_res_30_; 
v_res_30_ = lp_hoba_Hoba_Kind_initial_elim___redArg(v_initial_29_);
lean_dec(v_initial_29_);
return v_res_30_;
}
}
LEAN_EXPORT lean_object* lp_hoba_Hoba_Kind_initial_elim(lean_object* v_motive_31_, uint8_t v_t_32_, lean_object* v_h_33_, lean_object* v_initial_34_){
_start:
{
lean_inc(v_initial_34_);
return v_initial_34_;
}
}
LEAN_EXPORT lean_object* lp_hoba_Hoba_Kind_initial_elim___boxed(lean_object* v_motive_35_, lean_object* v_t_36_, lean_object* v_h_37_, lean_object* v_initial_38_){
_start:
{
uint8_t v_t_boxed_39_; lean_object* v_res_40_; 
v_t_boxed_39_ = lean_unbox(v_t_36_);
v_res_40_ = lp_hoba_Hoba_Kind_initial_elim(v_motive_35_, v_t_boxed_39_, v_h_37_, v_initial_38_);
lean_dec(v_initial_38_);
return v_res_40_;
}
}
LEAN_EXPORT lean_object* lp_hoba_Hoba_Kind_active_elim___redArg(lean_object* v_active_41_){
_start:
{
lean_inc(v_active_41_);
return v_active_41_;
}
}
LEAN_EXPORT lean_object* lp_hoba_Hoba_Kind_active_elim___redArg___boxed(lean_object* v_active_42_){
_start:
{
lean_object* v_res_43_; 
v_res_43_ = lp_hoba_Hoba_Kind_active_elim___redArg(v_active_42_);
lean_dec(v_active_42_);
return v_res_43_;
}
}
LEAN_EXPORT lean_object* lp_hoba_Hoba_Kind_active_elim(lean_object* v_motive_44_, uint8_t v_t_45_, lean_object* v_h_46_, lean_object* v_active_47_){
_start:
{
lean_inc(v_active_47_);
return v_active_47_;
}
}
LEAN_EXPORT lean_object* lp_hoba_Hoba_Kind_active_elim___boxed(lean_object* v_motive_48_, lean_object* v_t_49_, lean_object* v_h_50_, lean_object* v_active_51_){
_start:
{
uint8_t v_t_boxed_52_; lean_object* v_res_53_; 
v_t_boxed_52_ = lean_unbox(v_t_49_);
v_res_53_ = lp_hoba_Hoba_Kind_active_elim(v_motive_48_, v_t_boxed_52_, v_h_50_, v_active_51_);
lean_dec(v_active_51_);
return v_res_53_;
}
}
LEAN_EXPORT lean_object* lp_hoba_Hoba_Kind_terminal_elim___redArg(lean_object* v_terminal_54_){
_start:
{
lean_inc(v_terminal_54_);
return v_terminal_54_;
}
}
LEAN_EXPORT lean_object* lp_hoba_Hoba_Kind_terminal_elim___redArg___boxed(lean_object* v_terminal_55_){
_start:
{
lean_object* v_res_56_; 
v_res_56_ = lp_hoba_Hoba_Kind_terminal_elim___redArg(v_terminal_55_);
lean_dec(v_terminal_55_);
return v_res_56_;
}
}
LEAN_EXPORT lean_object* lp_hoba_Hoba_Kind_terminal_elim(lean_object* v_motive_57_, uint8_t v_t_58_, lean_object* v_h_59_, lean_object* v_terminal_60_){
_start:
{
lean_inc(v_terminal_60_);
return v_terminal_60_;
}
}
LEAN_EXPORT lean_object* lp_hoba_Hoba_Kind_terminal_elim___boxed(lean_object* v_motive_61_, lean_object* v_t_62_, lean_object* v_h_63_, lean_object* v_terminal_64_){
_start:
{
uint8_t v_t_boxed_65_; lean_object* v_res_66_; 
v_t_boxed_65_ = lean_unbox(v_t_62_);
v_res_66_ = lp_hoba_Hoba_Kind_terminal_elim(v_motive_61_, v_t_boxed_65_, v_h_63_, v_terminal_64_);
lean_dec(v_terminal_64_);
return v_res_66_;
}
}
LEAN_EXPORT uint8_t lp_hoba_Hoba_Kind_ofNat(lean_object* v_n_67_){
_start:
{
lean_object* v___x_68_; uint8_t v___x_69_; 
v___x_68_ = lean_unsigned_to_nat(0u);
v___x_69_ = lean_nat_dec_le(v_n_67_, v___x_68_);
if (v___x_69_ == 0)
{
lean_object* v___x_70_; uint8_t v___x_71_; 
v___x_70_ = lean_unsigned_to_nat(1u);
v___x_71_ = lean_nat_dec_le(v_n_67_, v___x_70_);
if (v___x_71_ == 0)
{
uint8_t v___x_72_; 
v___x_72_ = 2;
return v___x_72_;
}
else
{
uint8_t v___x_73_; 
v___x_73_ = 1;
return v___x_73_;
}
}
else
{
uint8_t v___x_74_; 
v___x_74_ = 0;
return v___x_74_;
}
}
}
LEAN_EXPORT lean_object* lp_hoba_Hoba_Kind_ofNat___boxed(lean_object* v_n_75_){
_start:
{
uint8_t v_res_76_; lean_object* v_r_77_; 
v_res_76_ = lp_hoba_Hoba_Kind_ofNat(v_n_75_);
lean_dec(v_n_75_);
v_r_77_ = lean_box(v_res_76_);
return v_r_77_;
}
}
LEAN_EXPORT uint8_t lp_hoba_Hoba_instDecidableEqKind(uint8_t v_x_78_, uint8_t v_y_79_){
_start:
{
lean_object* v___x_80_; lean_object* v___x_81_; uint8_t v___x_82_; 
v___x_80_ = lp_hoba_Hoba_Kind_ctorIdx(v_x_78_);
v___x_81_ = lp_hoba_Hoba_Kind_ctorIdx(v_y_79_);
v___x_82_ = lean_nat_dec_eq(v___x_80_, v___x_81_);
lean_dec(v___x_81_);
lean_dec(v___x_80_);
return v___x_82_;
}
}
LEAN_EXPORT lean_object* lp_hoba_Hoba_instDecidableEqKind___boxed(lean_object* v_x_83_, lean_object* v_y_84_){
_start:
{
uint8_t v_x_13__boxed_85_; uint8_t v_y_14__boxed_86_; uint8_t v_res_87_; lean_object* v_r_88_; 
v_x_13__boxed_85_ = lean_unbox(v_x_83_);
v_y_14__boxed_86_ = lean_unbox(v_y_84_);
v_res_87_ = lp_hoba_Hoba_instDecidableEqKind(v_x_13__boxed_85_, v_y_14__boxed_86_);
v_r_88_ = lean_box(v_res_87_);
return v_r_88_;
}
}
static lean_object* _init_lp_hoba_Hoba_instReprKind_repr___closed__6(void){
_start:
{
lean_object* v___x_98_; lean_object* v___x_99_; 
v___x_98_ = lean_unsigned_to_nat(2u);
v___x_99_ = lean_nat_to_int(v___x_98_);
return v___x_99_;
}
}
static lean_object* _init_lp_hoba_Hoba_instReprKind_repr___closed__7(void){
_start:
{
lean_object* v___x_100_; lean_object* v___x_101_; 
v___x_100_ = lean_unsigned_to_nat(1u);
v___x_101_ = lean_nat_to_int(v___x_100_);
return v___x_101_;
}
}
LEAN_EXPORT lean_object* lp_hoba_Hoba_instReprKind_repr(uint8_t v_x_102_, lean_object* v_prec_103_){
_start:
{
lean_object* v___y_105_; lean_object* v___y_112_; lean_object* v___y_119_; 
switch(v_x_102_)
{
case 0:
{
lean_object* v___x_125_; uint8_t v___x_126_; 
v___x_125_ = lean_unsigned_to_nat(1024u);
v___x_126_ = lean_nat_dec_le(v___x_125_, v_prec_103_);
if (v___x_126_ == 0)
{
lean_object* v___x_127_; 
v___x_127_ = lean_obj_once(&lp_hoba_Hoba_instReprKind_repr___closed__6, &lp_hoba_Hoba_instReprKind_repr___closed__6_once, _init_lp_hoba_Hoba_instReprKind_repr___closed__6);
v___y_105_ = v___x_127_;
goto v___jp_104_;
}
else
{
lean_object* v___x_128_; 
v___x_128_ = lean_obj_once(&lp_hoba_Hoba_instReprKind_repr___closed__7, &lp_hoba_Hoba_instReprKind_repr___closed__7_once, _init_lp_hoba_Hoba_instReprKind_repr___closed__7);
v___y_105_ = v___x_128_;
goto v___jp_104_;
}
}
case 1:
{
lean_object* v___x_129_; uint8_t v___x_130_; 
v___x_129_ = lean_unsigned_to_nat(1024u);
v___x_130_ = lean_nat_dec_le(v___x_129_, v_prec_103_);
if (v___x_130_ == 0)
{
lean_object* v___x_131_; 
v___x_131_ = lean_obj_once(&lp_hoba_Hoba_instReprKind_repr___closed__6, &lp_hoba_Hoba_instReprKind_repr___closed__6_once, _init_lp_hoba_Hoba_instReprKind_repr___closed__6);
v___y_112_ = v___x_131_;
goto v___jp_111_;
}
else
{
lean_object* v___x_132_; 
v___x_132_ = lean_obj_once(&lp_hoba_Hoba_instReprKind_repr___closed__7, &lp_hoba_Hoba_instReprKind_repr___closed__7_once, _init_lp_hoba_Hoba_instReprKind_repr___closed__7);
v___y_112_ = v___x_132_;
goto v___jp_111_;
}
}
default: 
{
lean_object* v___x_133_; uint8_t v___x_134_; 
v___x_133_ = lean_unsigned_to_nat(1024u);
v___x_134_ = lean_nat_dec_le(v___x_133_, v_prec_103_);
if (v___x_134_ == 0)
{
lean_object* v___x_135_; 
v___x_135_ = lean_obj_once(&lp_hoba_Hoba_instReprKind_repr___closed__6, &lp_hoba_Hoba_instReprKind_repr___closed__6_once, _init_lp_hoba_Hoba_instReprKind_repr___closed__6);
v___y_119_ = v___x_135_;
goto v___jp_118_;
}
else
{
lean_object* v___x_136_; 
v___x_136_ = lean_obj_once(&lp_hoba_Hoba_instReprKind_repr___closed__7, &lp_hoba_Hoba_instReprKind_repr___closed__7_once, _init_lp_hoba_Hoba_instReprKind_repr___closed__7);
v___y_119_ = v___x_136_;
goto v___jp_118_;
}
}
}
v___jp_104_:
{
lean_object* v___x_106_; lean_object* v___x_107_; uint8_t v___x_108_; lean_object* v___x_109_; lean_object* v___x_110_; 
v___x_106_ = ((lean_object*)(lp_hoba_Hoba_instReprKind_repr___closed__1));
lean_inc(v___y_105_);
v___x_107_ = lean_alloc_ctor(4, 2, 0);
lean_ctor_set(v___x_107_, 0, v___y_105_);
lean_ctor_set(v___x_107_, 1, v___x_106_);
v___x_108_ = 0;
v___x_109_ = lean_alloc_ctor(6, 1, 1);
lean_ctor_set(v___x_109_, 0, v___x_107_);
lean_ctor_set_uint8(v___x_109_, sizeof(void*)*1, v___x_108_);
v___x_110_ = l_Repr_addAppParen(v___x_109_, v_prec_103_);
return v___x_110_;
}
v___jp_111_:
{
lean_object* v___x_113_; lean_object* v___x_114_; uint8_t v___x_115_; lean_object* v___x_116_; lean_object* v___x_117_; 
v___x_113_ = ((lean_object*)(lp_hoba_Hoba_instReprKind_repr___closed__3));
lean_inc(v___y_112_);
v___x_114_ = lean_alloc_ctor(4, 2, 0);
lean_ctor_set(v___x_114_, 0, v___y_112_);
lean_ctor_set(v___x_114_, 1, v___x_113_);
v___x_115_ = 0;
v___x_116_ = lean_alloc_ctor(6, 1, 1);
lean_ctor_set(v___x_116_, 0, v___x_114_);
lean_ctor_set_uint8(v___x_116_, sizeof(void*)*1, v___x_115_);
v___x_117_ = l_Repr_addAppParen(v___x_116_, v_prec_103_);
return v___x_117_;
}
v___jp_118_:
{
lean_object* v___x_120_; lean_object* v___x_121_; uint8_t v___x_122_; lean_object* v___x_123_; lean_object* v___x_124_; 
v___x_120_ = ((lean_object*)(lp_hoba_Hoba_instReprKind_repr___closed__5));
lean_inc(v___y_119_);
v___x_121_ = lean_alloc_ctor(4, 2, 0);
lean_ctor_set(v___x_121_, 0, v___y_119_);
lean_ctor_set(v___x_121_, 1, v___x_120_);
v___x_122_ = 0;
v___x_123_ = lean_alloc_ctor(6, 1, 1);
lean_ctor_set(v___x_123_, 0, v___x_121_);
lean_ctor_set_uint8(v___x_123_, sizeof(void*)*1, v___x_122_);
v___x_124_ = l_Repr_addAppParen(v___x_123_, v_prec_103_);
return v___x_124_;
}
}
}
LEAN_EXPORT lean_object* lp_hoba_Hoba_instReprKind_repr___boxed(lean_object* v_x_137_, lean_object* v_prec_138_){
_start:
{
uint8_t v_x_177__boxed_139_; lean_object* v_res_140_; 
v_x_177__boxed_139_ = lean_unbox(v_x_137_);
v_res_140_ = lp_hoba_Hoba_instReprKind_repr(v_x_177__boxed_139_, v_prec_138_);
lean_dec(v_prec_138_);
return v_res_140_;
}
}
static uint8_t _init_lp_hoba_Hoba_instInhabitedKind_default(void){
_start:
{
uint8_t v___x_143_; 
v___x_143_ = 0;
return v___x_143_;
}
}
static uint8_t _init_lp_hoba_Hoba_instInhabitedKind(void){
_start:
{
uint8_t v___x_144_; 
v___x_144_ = 0;
return v___x_144_;
}
}
LEAN_EXPORT lean_object* lp_hoba_List_foldl___at___00List_foldl___at___00Std_Format_joinSep___at___00List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3_spec__7_spec__11_spec__15(lean_object* v_x_145_, lean_object* v_x_146_, lean_object* v_x_147_){
_start:
{
if (lean_obj_tag(v_x_147_) == 0)
{
lean_dec(v_x_145_);
return v_x_146_;
}
else
{
lean_object* v_head_148_; lean_object* v_tail_149_; lean_object* v___x_151_; uint8_t v_isShared_152_; uint8_t v_isSharedCheck_160_; 
v_head_148_ = lean_ctor_get(v_x_147_, 0);
v_tail_149_ = lean_ctor_get(v_x_147_, 1);
v_isSharedCheck_160_ = !lean_is_exclusive(v_x_147_);
if (v_isSharedCheck_160_ == 0)
{
v___x_151_ = v_x_147_;
v_isShared_152_ = v_isSharedCheck_160_;
goto v_resetjp_150_;
}
else
{
lean_inc(v_tail_149_);
lean_inc(v_head_148_);
lean_dec(v_x_147_);
v___x_151_ = lean_box(0);
v_isShared_152_ = v_isSharedCheck_160_;
goto v_resetjp_150_;
}
v_resetjp_150_:
{
lean_object* v___x_154_; 
lean_inc(v_x_145_);
if (v_isShared_152_ == 0)
{
lean_ctor_set_tag(v___x_151_, 5);
lean_ctor_set(v___x_151_, 1, v_x_145_);
lean_ctor_set(v___x_151_, 0, v_x_146_);
v___x_154_ = v___x_151_;
goto v_reusejp_153_;
}
else
{
lean_object* v_reuseFailAlloc_159_; 
v_reuseFailAlloc_159_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v_reuseFailAlloc_159_, 0, v_x_146_);
lean_ctor_set(v_reuseFailAlloc_159_, 1, v_x_145_);
v___x_154_ = v_reuseFailAlloc_159_;
goto v_reusejp_153_;
}
v_reusejp_153_:
{
lean_object* v___x_155_; lean_object* v___x_156_; lean_object* v___x_157_; 
v___x_155_ = l_Nat_reprFast(v_head_148_);
v___x_156_ = lean_alloc_ctor(3, 1, 0);
lean_ctor_set(v___x_156_, 0, v___x_155_);
v___x_157_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_157_, 0, v___x_154_);
lean_ctor_set(v___x_157_, 1, v___x_156_);
v_x_146_ = v___x_157_;
v_x_147_ = v_tail_149_;
goto _start;
}
}
}
}
}
LEAN_EXPORT lean_object* lp_hoba_List_foldl___at___00Std_Format_joinSep___at___00List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3_spec__7_spec__11(lean_object* v_x_161_, lean_object* v_x_162_, lean_object* v_x_163_){
_start:
{
if (lean_obj_tag(v_x_163_) == 0)
{
lean_dec(v_x_161_);
return v_x_162_;
}
else
{
lean_object* v_head_164_; lean_object* v_tail_165_; lean_object* v___x_167_; uint8_t v_isShared_168_; uint8_t v_isSharedCheck_176_; 
v_head_164_ = lean_ctor_get(v_x_163_, 0);
v_tail_165_ = lean_ctor_get(v_x_163_, 1);
v_isSharedCheck_176_ = !lean_is_exclusive(v_x_163_);
if (v_isSharedCheck_176_ == 0)
{
v___x_167_ = v_x_163_;
v_isShared_168_ = v_isSharedCheck_176_;
goto v_resetjp_166_;
}
else
{
lean_inc(v_tail_165_);
lean_inc(v_head_164_);
lean_dec(v_x_163_);
v___x_167_ = lean_box(0);
v_isShared_168_ = v_isSharedCheck_176_;
goto v_resetjp_166_;
}
v_resetjp_166_:
{
lean_object* v___x_170_; 
lean_inc(v_x_161_);
if (v_isShared_168_ == 0)
{
lean_ctor_set_tag(v___x_167_, 5);
lean_ctor_set(v___x_167_, 1, v_x_161_);
lean_ctor_set(v___x_167_, 0, v_x_162_);
v___x_170_ = v___x_167_;
goto v_reusejp_169_;
}
else
{
lean_object* v_reuseFailAlloc_175_; 
v_reuseFailAlloc_175_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v_reuseFailAlloc_175_, 0, v_x_162_);
lean_ctor_set(v_reuseFailAlloc_175_, 1, v_x_161_);
v___x_170_ = v_reuseFailAlloc_175_;
goto v_reusejp_169_;
}
v_reusejp_169_:
{
lean_object* v___x_171_; lean_object* v___x_172_; lean_object* v___x_173_; lean_object* v___x_174_; 
v___x_171_ = l_Nat_reprFast(v_head_164_);
v___x_172_ = lean_alloc_ctor(3, 1, 0);
lean_ctor_set(v___x_172_, 0, v___x_171_);
v___x_173_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_173_, 0, v___x_170_);
lean_ctor_set(v___x_173_, 1, v___x_172_);
v___x_174_ = lp_hoba_List_foldl___at___00List_foldl___at___00Std_Format_joinSep___at___00List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3_spec__7_spec__11_spec__15(v_x_161_, v___x_173_, v_tail_165_);
return v___x_174_;
}
}
}
}
}
LEAN_EXPORT lean_object* lp_hoba_Std_Format_joinSep___at___00List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3_spec__7___lam__0(lean_object* v___y_177_){
_start:
{
lean_object* v___x_178_; lean_object* v___x_179_; 
v___x_178_ = l_Nat_reprFast(v___y_177_);
v___x_179_ = lean_alloc_ctor(3, 1, 0);
lean_ctor_set(v___x_179_, 0, v___x_178_);
return v___x_179_;
}
}
LEAN_EXPORT lean_object* lp_hoba_Std_Format_joinSep___at___00List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3_spec__7(lean_object* v_x_180_, lean_object* v_x_181_){
_start:
{
if (lean_obj_tag(v_x_180_) == 0)
{
lean_object* v___x_182_; 
lean_dec(v_x_181_);
v___x_182_ = lean_box(0);
return v___x_182_;
}
else
{
lean_object* v_tail_183_; 
v_tail_183_ = lean_ctor_get(v_x_180_, 1);
if (lean_obj_tag(v_tail_183_) == 0)
{
lean_object* v_head_184_; lean_object* v___x_185_; 
lean_dec(v_x_181_);
v_head_184_ = lean_ctor_get(v_x_180_, 0);
lean_inc(v_head_184_);
lean_dec_ref_known(v_x_180_, 2);
v___x_185_ = lp_hoba_Std_Format_joinSep___at___00List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3_spec__7___lam__0(v_head_184_);
return v___x_185_;
}
else
{
lean_object* v_head_186_; lean_object* v___x_187_; lean_object* v___x_188_; 
lean_inc(v_tail_183_);
v_head_186_ = lean_ctor_get(v_x_180_, 0);
lean_inc(v_head_186_);
lean_dec_ref_known(v_x_180_, 2);
v___x_187_ = lp_hoba_Std_Format_joinSep___at___00List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3_spec__7___lam__0(v_head_186_);
v___x_188_ = lp_hoba_List_foldl___at___00Std_Format_joinSep___at___00List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3_spec__7_spec__11(v_x_181_, v___x_187_, v_tail_183_);
return v___x_188_;
}
}
}
}
static lean_object* _init_lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__7(void){
_start:
{
lean_object* v___x_200_; lean_object* v___x_201_; 
v___x_200_ = ((lean_object*)(lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__2));
v___x_201_ = lean_string_length(v___x_200_);
return v___x_201_;
}
}
static lean_object* _init_lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__8(void){
_start:
{
lean_object* v___x_202_; lean_object* v___x_203_; 
v___x_202_ = lean_obj_once(&lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__7, &lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__7_once, _init_lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__7);
v___x_203_ = lean_nat_to_int(v___x_202_);
return v___x_203_;
}
}
LEAN_EXPORT lean_object* lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg(lean_object* v_a_208_){
_start:
{
if (lean_obj_tag(v_a_208_) == 0)
{
lean_object* v___x_209_; 
v___x_209_ = ((lean_object*)(lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__1));
return v___x_209_;
}
else
{
lean_object* v___x_210_; lean_object* v___x_211_; lean_object* v___x_212_; lean_object* v___x_213_; lean_object* v___x_214_; lean_object* v___x_215_; lean_object* v___x_216_; lean_object* v___x_217_; lean_object* v___x_218_; 
v___x_210_ = ((lean_object*)(lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__5));
v___x_211_ = lp_hoba_Std_Format_joinSep___at___00List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3_spec__7(v_a_208_, v___x_210_);
v___x_212_ = lean_obj_once(&lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__8, &lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__8_once, _init_lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__8);
v___x_213_ = ((lean_object*)(lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__9));
v___x_214_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_214_, 0, v___x_213_);
lean_ctor_set(v___x_214_, 1, v___x_211_);
v___x_215_ = ((lean_object*)(lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__10));
v___x_216_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_216_, 0, v___x_214_);
lean_ctor_set(v___x_216_, 1, v___x_215_);
v___x_217_ = lean_alloc_ctor(4, 2, 0);
lean_ctor_set(v___x_217_, 0, v___x_212_);
lean_ctor_set(v___x_217_, 1, v___x_216_);
v___x_218_ = l_Std_Format_fill(v___x_217_);
return v___x_218_;
}
}
}
LEAN_EXPORT lean_object* lp_hoba_List_foldl___at___00List_foldl___at___00Std_Format_joinSep___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__1_spec__2_spec__4_spec__8(lean_object* v_x_219_, lean_object* v_x_220_, lean_object* v_x_221_){
_start:
{
if (lean_obj_tag(v_x_221_) == 0)
{
lean_dec(v_x_219_);
return v_x_220_;
}
else
{
lean_object* v_head_222_; lean_object* v_tail_223_; lean_object* v___x_225_; uint8_t v_isShared_226_; uint8_t v_isSharedCheck_233_; 
v_head_222_ = lean_ctor_get(v_x_221_, 0);
v_tail_223_ = lean_ctor_get(v_x_221_, 1);
v_isSharedCheck_233_ = !lean_is_exclusive(v_x_221_);
if (v_isSharedCheck_233_ == 0)
{
v___x_225_ = v_x_221_;
v_isShared_226_ = v_isSharedCheck_233_;
goto v_resetjp_224_;
}
else
{
lean_inc(v_tail_223_);
lean_inc(v_head_222_);
lean_dec(v_x_221_);
v___x_225_ = lean_box(0);
v_isShared_226_ = v_isSharedCheck_233_;
goto v_resetjp_224_;
}
v_resetjp_224_:
{
lean_object* v___x_228_; 
lean_inc(v_x_219_);
if (v_isShared_226_ == 0)
{
lean_ctor_set_tag(v___x_225_, 5);
lean_ctor_set(v___x_225_, 1, v_x_219_);
lean_ctor_set(v___x_225_, 0, v_x_220_);
v___x_228_ = v___x_225_;
goto v_reusejp_227_;
}
else
{
lean_object* v_reuseFailAlloc_232_; 
v_reuseFailAlloc_232_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v_reuseFailAlloc_232_, 0, v_x_220_);
lean_ctor_set(v_reuseFailAlloc_232_, 1, v_x_219_);
v___x_228_ = v_reuseFailAlloc_232_;
goto v_reusejp_227_;
}
v_reusejp_227_:
{
lean_object* v___x_229_; lean_object* v___x_230_; 
v___x_229_ = lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg(v_head_222_);
v___x_230_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_230_, 0, v___x_228_);
lean_ctor_set(v___x_230_, 1, v___x_229_);
v_x_220_ = v___x_230_;
v_x_221_ = v_tail_223_;
goto _start;
}
}
}
}
}
LEAN_EXPORT lean_object* lp_hoba_List_foldl___at___00Std_Format_joinSep___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__1_spec__2_spec__4(lean_object* v_x_234_, lean_object* v_x_235_, lean_object* v_x_236_){
_start:
{
if (lean_obj_tag(v_x_236_) == 0)
{
lean_dec(v_x_234_);
return v_x_235_;
}
else
{
lean_object* v_head_237_; lean_object* v_tail_238_; lean_object* v___x_240_; uint8_t v_isShared_241_; uint8_t v_isSharedCheck_248_; 
v_head_237_ = lean_ctor_get(v_x_236_, 0);
v_tail_238_ = lean_ctor_get(v_x_236_, 1);
v_isSharedCheck_248_ = !lean_is_exclusive(v_x_236_);
if (v_isSharedCheck_248_ == 0)
{
v___x_240_ = v_x_236_;
v_isShared_241_ = v_isSharedCheck_248_;
goto v_resetjp_239_;
}
else
{
lean_inc(v_tail_238_);
lean_inc(v_head_237_);
lean_dec(v_x_236_);
v___x_240_ = lean_box(0);
v_isShared_241_ = v_isSharedCheck_248_;
goto v_resetjp_239_;
}
v_resetjp_239_:
{
lean_object* v___x_243_; 
lean_inc(v_x_234_);
if (v_isShared_241_ == 0)
{
lean_ctor_set_tag(v___x_240_, 5);
lean_ctor_set(v___x_240_, 1, v_x_234_);
lean_ctor_set(v___x_240_, 0, v_x_235_);
v___x_243_ = v___x_240_;
goto v_reusejp_242_;
}
else
{
lean_object* v_reuseFailAlloc_247_; 
v_reuseFailAlloc_247_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v_reuseFailAlloc_247_, 0, v_x_235_);
lean_ctor_set(v_reuseFailAlloc_247_, 1, v_x_234_);
v___x_243_ = v_reuseFailAlloc_247_;
goto v_reusejp_242_;
}
v_reusejp_242_:
{
lean_object* v___x_244_; lean_object* v___x_245_; lean_object* v___x_246_; 
v___x_244_ = lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg(v_head_237_);
v___x_245_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_245_, 0, v___x_243_);
lean_ctor_set(v___x_245_, 1, v___x_244_);
v___x_246_ = lp_hoba_List_foldl___at___00List_foldl___at___00Std_Format_joinSep___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__1_spec__2_spec__4_spec__8(v_x_234_, v___x_245_, v_tail_238_);
return v___x_246_;
}
}
}
}
}
LEAN_EXPORT lean_object* lp_hoba_Std_Format_joinSep___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__1_spec__2(lean_object* v_x_249_, lean_object* v_x_250_){
_start:
{
if (lean_obj_tag(v_x_249_) == 0)
{
lean_object* v___x_251_; 
lean_dec(v_x_250_);
v___x_251_ = lean_box(0);
return v___x_251_;
}
else
{
lean_object* v_tail_252_; 
v_tail_252_ = lean_ctor_get(v_x_249_, 1);
if (lean_obj_tag(v_tail_252_) == 0)
{
lean_object* v_head_253_; lean_object* v___x_254_; 
lean_dec(v_x_250_);
v_head_253_ = lean_ctor_get(v_x_249_, 0);
lean_inc(v_head_253_);
lean_dec_ref_known(v_x_249_, 2);
v___x_254_ = lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg(v_head_253_);
return v___x_254_;
}
else
{
lean_object* v_head_255_; lean_object* v___x_256_; lean_object* v___x_257_; 
lean_inc(v_tail_252_);
v_head_255_ = lean_ctor_get(v_x_249_, 0);
lean_inc(v_head_255_);
lean_dec_ref_known(v_x_249_, 2);
v___x_256_ = lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg(v_head_255_);
v___x_257_ = lp_hoba_List_foldl___at___00Std_Format_joinSep___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__1_spec__2_spec__4(v_x_250_, v___x_256_, v_tail_252_);
return v___x_257_;
}
}
}
}
LEAN_EXPORT lean_object* lp_hoba_List_repr___at___00Hoba_instReprMachine_repr_spec__1___redArg(lean_object* v_a_258_){
_start:
{
if (lean_obj_tag(v_a_258_) == 0)
{
lean_object* v___x_259_; 
v___x_259_ = ((lean_object*)(lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__1));
return v___x_259_;
}
else
{
lean_object* v___x_260_; lean_object* v___x_261_; lean_object* v___x_262_; lean_object* v___x_263_; lean_object* v___x_264_; lean_object* v___x_265_; lean_object* v___x_266_; lean_object* v___x_267_; uint8_t v___x_268_; lean_object* v___x_269_; 
v___x_260_ = ((lean_object*)(lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__5));
v___x_261_ = lp_hoba_Std_Format_joinSep___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__1_spec__2(v_a_258_, v___x_260_);
v___x_262_ = lean_obj_once(&lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__8, &lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__8_once, _init_lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__8);
v___x_263_ = ((lean_object*)(lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__9));
v___x_264_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_264_, 0, v___x_263_);
lean_ctor_set(v___x_264_, 1, v___x_261_);
v___x_265_ = ((lean_object*)(lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__10));
v___x_266_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_266_, 0, v___x_264_);
lean_ctor_set(v___x_266_, 1, v___x_265_);
v___x_267_ = lean_alloc_ctor(4, 2, 0);
lean_ctor_set(v___x_267_, 0, v___x_262_);
lean_ctor_set(v___x_267_, 1, v___x_266_);
v___x_268_ = 0;
v___x_269_ = lean_alloc_ctor(6, 1, 1);
lean_ctor_set(v___x_269_, 0, v___x_267_);
lean_ctor_set_uint8(v___x_269_, sizeof(void*)*1, v___x_268_);
return v___x_269_;
}
}
}
static lean_object* _init_lp_hoba_Prod_repr___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__2_spec__4___redArg___closed__2(void){
_start:
{
lean_object* v___x_272_; lean_object* v___x_273_; 
v___x_272_ = ((lean_object*)(lp_hoba_Prod_repr___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__2_spec__4___redArg___closed__0));
v___x_273_ = lean_string_length(v___x_272_);
return v___x_273_;
}
}
static lean_object* _init_lp_hoba_Prod_repr___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__2_spec__4___redArg___closed__3(void){
_start:
{
lean_object* v___x_274_; lean_object* v___x_275_; 
v___x_274_ = lean_obj_once(&lp_hoba_Prod_repr___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__2_spec__4___redArg___closed__2, &lp_hoba_Prod_repr___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__2_spec__4___redArg___closed__2_once, _init_lp_hoba_Prod_repr___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__2_spec__4___redArg___closed__2);
v___x_275_ = lean_nat_to_int(v___x_274_);
return v___x_275_;
}
}
LEAN_EXPORT lean_object* lp_hoba_Prod_repr___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__2_spec__4___redArg(lean_object* v_x_280_){
_start:
{
lean_object* v_fst_281_; lean_object* v_snd_282_; lean_object* v___x_284_; uint8_t v_isShared_285_; uint8_t v_isSharedCheck_306_; 
v_fst_281_ = lean_ctor_get(v_x_280_, 0);
v_snd_282_ = lean_ctor_get(v_x_280_, 1);
v_isSharedCheck_306_ = !lean_is_exclusive(v_x_280_);
if (v_isSharedCheck_306_ == 0)
{
v___x_284_ = v_x_280_;
v_isShared_285_ = v_isSharedCheck_306_;
goto v_resetjp_283_;
}
else
{
lean_inc(v_snd_282_);
lean_inc(v_fst_281_);
lean_dec(v_x_280_);
v___x_284_ = lean_box(0);
v_isShared_285_ = v_isSharedCheck_306_;
goto v_resetjp_283_;
}
v_resetjp_283_:
{
lean_object* v___x_286_; lean_object* v___x_287_; lean_object* v___x_288_; lean_object* v___x_290_; 
v___x_286_ = l_Nat_reprFast(v_fst_281_);
v___x_287_ = lean_alloc_ctor(3, 1, 0);
lean_ctor_set(v___x_287_, 0, v___x_286_);
v___x_288_ = lean_box(0);
if (v_isShared_285_ == 0)
{
lean_ctor_set_tag(v___x_284_, 1);
lean_ctor_set(v___x_284_, 1, v___x_288_);
lean_ctor_set(v___x_284_, 0, v___x_287_);
v___x_290_ = v___x_284_;
goto v_reusejp_289_;
}
else
{
lean_object* v_reuseFailAlloc_305_; 
v_reuseFailAlloc_305_ = lean_alloc_ctor(1, 2, 0);
lean_ctor_set(v_reuseFailAlloc_305_, 0, v___x_287_);
lean_ctor_set(v_reuseFailAlloc_305_, 1, v___x_288_);
v___x_290_ = v_reuseFailAlloc_305_;
goto v_reusejp_289_;
}
v_reusejp_289_:
{
lean_object* v___x_291_; lean_object* v___x_292_; lean_object* v___x_293_; lean_object* v___x_294_; lean_object* v___x_295_; lean_object* v___x_296_; lean_object* v___x_297_; lean_object* v___x_298_; lean_object* v___x_299_; lean_object* v___x_300_; lean_object* v___x_301_; lean_object* v___x_302_; uint8_t v___x_303_; lean_object* v___x_304_; 
v___x_291_ = l_Nat_reprFast(v_snd_282_);
v___x_292_ = lean_alloc_ctor(3, 1, 0);
lean_ctor_set(v___x_292_, 0, v___x_291_);
v___x_293_ = lean_alloc_ctor(1, 2, 0);
lean_ctor_set(v___x_293_, 0, v___x_292_);
lean_ctor_set(v___x_293_, 1, v___x_290_);
v___x_294_ = l_List_reverse___redArg(v___x_293_);
v___x_295_ = ((lean_object*)(lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__5));
v___x_296_ = l_Std_Format_joinSep___at___00Lean_Syntax_formatStxAux_spec__2(v___x_294_, v___x_295_);
v___x_297_ = lean_obj_once(&lp_hoba_Prod_repr___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__2_spec__4___redArg___closed__3, &lp_hoba_Prod_repr___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__2_spec__4___redArg___closed__3_once, _init_lp_hoba_Prod_repr___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__2_spec__4___redArg___closed__3);
v___x_298_ = ((lean_object*)(lp_hoba_Prod_repr___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__2_spec__4___redArg___closed__4));
v___x_299_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_299_, 0, v___x_298_);
lean_ctor_set(v___x_299_, 1, v___x_296_);
v___x_300_ = ((lean_object*)(lp_hoba_Prod_repr___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__2_spec__4___redArg___closed__5));
v___x_301_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_301_, 0, v___x_299_);
lean_ctor_set(v___x_301_, 1, v___x_300_);
v___x_302_ = lean_alloc_ctor(4, 2, 0);
lean_ctor_set(v___x_302_, 0, v___x_297_);
lean_ctor_set(v___x_302_, 1, v___x_301_);
v___x_303_ = 0;
v___x_304_ = lean_alloc_ctor(6, 1, 1);
lean_ctor_set(v___x_304_, 0, v___x_302_);
lean_ctor_set_uint8(v___x_304_, sizeof(void*)*1, v___x_303_);
return v___x_304_;
}
}
}
}
LEAN_EXPORT lean_object* lp_hoba_List_foldl___at___00List_foldl___at___00Std_Format_joinSep___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__2_spec__5_spec__8_spec__12(lean_object* v_x_307_, lean_object* v_x_308_, lean_object* v_x_309_){
_start:
{
if (lean_obj_tag(v_x_309_) == 0)
{
lean_dec(v_x_307_);
return v_x_308_;
}
else
{
lean_object* v_head_310_; lean_object* v_tail_311_; lean_object* v___x_313_; uint8_t v_isShared_314_; uint8_t v_isSharedCheck_321_; 
v_head_310_ = lean_ctor_get(v_x_309_, 0);
v_tail_311_ = lean_ctor_get(v_x_309_, 1);
v_isSharedCheck_321_ = !lean_is_exclusive(v_x_309_);
if (v_isSharedCheck_321_ == 0)
{
v___x_313_ = v_x_309_;
v_isShared_314_ = v_isSharedCheck_321_;
goto v_resetjp_312_;
}
else
{
lean_inc(v_tail_311_);
lean_inc(v_head_310_);
lean_dec(v_x_309_);
v___x_313_ = lean_box(0);
v_isShared_314_ = v_isSharedCheck_321_;
goto v_resetjp_312_;
}
v_resetjp_312_:
{
lean_object* v___x_316_; 
lean_inc(v_x_307_);
if (v_isShared_314_ == 0)
{
lean_ctor_set_tag(v___x_313_, 5);
lean_ctor_set(v___x_313_, 1, v_x_307_);
lean_ctor_set(v___x_313_, 0, v_x_308_);
v___x_316_ = v___x_313_;
goto v_reusejp_315_;
}
else
{
lean_object* v_reuseFailAlloc_320_; 
v_reuseFailAlloc_320_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v_reuseFailAlloc_320_, 0, v_x_308_);
lean_ctor_set(v_reuseFailAlloc_320_, 1, v_x_307_);
v___x_316_ = v_reuseFailAlloc_320_;
goto v_reusejp_315_;
}
v_reusejp_315_:
{
lean_object* v___x_317_; lean_object* v___x_318_; 
v___x_317_ = lp_hoba_Prod_repr___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__2_spec__4___redArg(v_head_310_);
v___x_318_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_318_, 0, v___x_316_);
lean_ctor_set(v___x_318_, 1, v___x_317_);
v_x_308_ = v___x_318_;
v_x_309_ = v_tail_311_;
goto _start;
}
}
}
}
}
LEAN_EXPORT lean_object* lp_hoba_List_foldl___at___00Std_Format_joinSep___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__2_spec__5_spec__8(lean_object* v_x_322_, lean_object* v_x_323_, lean_object* v_x_324_){
_start:
{
if (lean_obj_tag(v_x_324_) == 0)
{
lean_dec(v_x_322_);
return v_x_323_;
}
else
{
lean_object* v_head_325_; lean_object* v_tail_326_; lean_object* v___x_328_; uint8_t v_isShared_329_; uint8_t v_isSharedCheck_336_; 
v_head_325_ = lean_ctor_get(v_x_324_, 0);
v_tail_326_ = lean_ctor_get(v_x_324_, 1);
v_isSharedCheck_336_ = !lean_is_exclusive(v_x_324_);
if (v_isSharedCheck_336_ == 0)
{
v___x_328_ = v_x_324_;
v_isShared_329_ = v_isSharedCheck_336_;
goto v_resetjp_327_;
}
else
{
lean_inc(v_tail_326_);
lean_inc(v_head_325_);
lean_dec(v_x_324_);
v___x_328_ = lean_box(0);
v_isShared_329_ = v_isSharedCheck_336_;
goto v_resetjp_327_;
}
v_resetjp_327_:
{
lean_object* v___x_331_; 
lean_inc(v_x_322_);
if (v_isShared_329_ == 0)
{
lean_ctor_set_tag(v___x_328_, 5);
lean_ctor_set(v___x_328_, 1, v_x_322_);
lean_ctor_set(v___x_328_, 0, v_x_323_);
v___x_331_ = v___x_328_;
goto v_reusejp_330_;
}
else
{
lean_object* v_reuseFailAlloc_335_; 
v_reuseFailAlloc_335_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v_reuseFailAlloc_335_, 0, v_x_323_);
lean_ctor_set(v_reuseFailAlloc_335_, 1, v_x_322_);
v___x_331_ = v_reuseFailAlloc_335_;
goto v_reusejp_330_;
}
v_reusejp_330_:
{
lean_object* v___x_332_; lean_object* v___x_333_; lean_object* v___x_334_; 
v___x_332_ = lp_hoba_Prod_repr___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__2_spec__4___redArg(v_head_325_);
v___x_333_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_333_, 0, v___x_331_);
lean_ctor_set(v___x_333_, 1, v___x_332_);
v___x_334_ = lp_hoba_List_foldl___at___00List_foldl___at___00Std_Format_joinSep___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__2_spec__5_spec__8_spec__12(v_x_322_, v___x_333_, v_tail_326_);
return v___x_334_;
}
}
}
}
}
LEAN_EXPORT lean_object* lp_hoba_Std_Format_joinSep___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__2_spec__5(lean_object* v_x_337_, lean_object* v_x_338_){
_start:
{
if (lean_obj_tag(v_x_337_) == 0)
{
lean_object* v___x_339_; 
lean_dec(v_x_338_);
v___x_339_ = lean_box(0);
return v___x_339_;
}
else
{
lean_object* v_tail_340_; 
v_tail_340_ = lean_ctor_get(v_x_337_, 1);
if (lean_obj_tag(v_tail_340_) == 0)
{
lean_object* v_head_341_; lean_object* v___x_342_; 
lean_dec(v_x_338_);
v_head_341_ = lean_ctor_get(v_x_337_, 0);
lean_inc(v_head_341_);
lean_dec_ref_known(v_x_337_, 2);
v___x_342_ = lp_hoba_Prod_repr___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__2_spec__4___redArg(v_head_341_);
return v___x_342_;
}
else
{
lean_object* v_head_343_; lean_object* v___x_344_; lean_object* v___x_345_; 
lean_inc(v_tail_340_);
v_head_343_ = lean_ctor_get(v_x_337_, 0);
lean_inc(v_head_343_);
lean_dec_ref_known(v_x_337_, 2);
v___x_344_ = lp_hoba_Prod_repr___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__2_spec__4___redArg(v_head_343_);
v___x_345_ = lp_hoba_List_foldl___at___00Std_Format_joinSep___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__2_spec__5_spec__8(v_x_338_, v___x_344_, v_tail_340_);
return v___x_345_;
}
}
}
}
LEAN_EXPORT lean_object* lp_hoba_List_repr___at___00Hoba_instReprMachine_repr_spec__2___redArg(lean_object* v_a_346_){
_start:
{
if (lean_obj_tag(v_a_346_) == 0)
{
lean_object* v___x_347_; 
v___x_347_ = ((lean_object*)(lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__1));
return v___x_347_;
}
else
{
lean_object* v___x_348_; lean_object* v___x_349_; lean_object* v___x_350_; lean_object* v___x_351_; lean_object* v___x_352_; lean_object* v___x_353_; lean_object* v___x_354_; lean_object* v___x_355_; uint8_t v___x_356_; lean_object* v___x_357_; 
v___x_348_ = ((lean_object*)(lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__5));
v___x_349_ = lp_hoba_Std_Format_joinSep___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__2_spec__5(v_a_346_, v___x_348_);
v___x_350_ = lean_obj_once(&lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__8, &lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__8_once, _init_lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__8);
v___x_351_ = ((lean_object*)(lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__9));
v___x_352_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_352_, 0, v___x_351_);
lean_ctor_set(v___x_352_, 1, v___x_349_);
v___x_353_ = ((lean_object*)(lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__10));
v___x_354_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_354_, 0, v___x_352_);
lean_ctor_set(v___x_354_, 1, v___x_353_);
v___x_355_ = lean_alloc_ctor(4, 2, 0);
lean_ctor_set(v___x_355_, 0, v___x_350_);
lean_ctor_set(v___x_355_, 1, v___x_354_);
v___x_356_ = 0;
v___x_357_ = lean_alloc_ctor(6, 1, 1);
lean_ctor_set(v___x_357_, 0, v___x_355_);
lean_ctor_set_uint8(v___x_357_, sizeof(void*)*1, v___x_356_);
return v___x_357_;
}
}
}
LEAN_EXPORT lean_object* lp_hoba_Std_Format_joinSep___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__0_spec__0___lam__0(uint8_t v___y_358_){
_start:
{
lean_object* v___x_359_; lean_object* v___x_360_; 
v___x_359_ = lean_unsigned_to_nat(0u);
v___x_360_ = lp_hoba_Hoba_instReprKind_repr(v___y_358_, v___x_359_);
return v___x_360_;
}
}
LEAN_EXPORT lean_object* lp_hoba_Std_Format_joinSep___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__0_spec__0___lam__0___boxed(lean_object* v___y_361_){
_start:
{
uint8_t v___y_1547__boxed_362_; lean_object* v_res_363_; 
v___y_1547__boxed_362_ = lean_unbox(v___y_361_);
v_res_363_ = lp_hoba_Std_Format_joinSep___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__0_spec__0___lam__0(v___y_1547__boxed_362_);
return v_res_363_;
}
}
LEAN_EXPORT lean_object* lp_hoba_List_foldl___at___00List_foldl___at___00Std_Format_joinSep___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__0_spec__0_spec__1_spec__5(lean_object* v_x_364_, lean_object* v_x_365_, lean_object* v_x_366_){
_start:
{
if (lean_obj_tag(v_x_366_) == 0)
{
lean_dec(v_x_364_);
return v_x_365_;
}
else
{
lean_object* v_head_367_; lean_object* v_tail_368_; lean_object* v___x_370_; uint8_t v_isShared_371_; uint8_t v_isSharedCheck_380_; 
v_head_367_ = lean_ctor_get(v_x_366_, 0);
v_tail_368_ = lean_ctor_get(v_x_366_, 1);
v_isSharedCheck_380_ = !lean_is_exclusive(v_x_366_);
if (v_isSharedCheck_380_ == 0)
{
v___x_370_ = v_x_366_;
v_isShared_371_ = v_isSharedCheck_380_;
goto v_resetjp_369_;
}
else
{
lean_inc(v_tail_368_);
lean_inc(v_head_367_);
lean_dec(v_x_366_);
v___x_370_ = lean_box(0);
v_isShared_371_ = v_isSharedCheck_380_;
goto v_resetjp_369_;
}
v_resetjp_369_:
{
lean_object* v___x_373_; 
lean_inc(v_x_364_);
if (v_isShared_371_ == 0)
{
lean_ctor_set_tag(v___x_370_, 5);
lean_ctor_set(v___x_370_, 1, v_x_364_);
lean_ctor_set(v___x_370_, 0, v_x_365_);
v___x_373_ = v___x_370_;
goto v_reusejp_372_;
}
else
{
lean_object* v_reuseFailAlloc_379_; 
v_reuseFailAlloc_379_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v_reuseFailAlloc_379_, 0, v_x_365_);
lean_ctor_set(v_reuseFailAlloc_379_, 1, v_x_364_);
v___x_373_ = v_reuseFailAlloc_379_;
goto v_reusejp_372_;
}
v_reusejp_372_:
{
lean_object* v___x_374_; uint8_t v___x_375_; lean_object* v___x_376_; lean_object* v___x_377_; 
v___x_374_ = lean_unsigned_to_nat(0u);
v___x_375_ = lean_unbox(v_head_367_);
lean_dec(v_head_367_);
v___x_376_ = lp_hoba_Hoba_instReprKind_repr(v___x_375_, v___x_374_);
v___x_377_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_377_, 0, v___x_373_);
lean_ctor_set(v___x_377_, 1, v___x_376_);
v_x_365_ = v___x_377_;
v_x_366_ = v_tail_368_;
goto _start;
}
}
}
}
}
LEAN_EXPORT lean_object* lp_hoba_List_foldl___at___00Std_Format_joinSep___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__0_spec__0_spec__1(lean_object* v_x_381_, lean_object* v_x_382_, lean_object* v_x_383_){
_start:
{
if (lean_obj_tag(v_x_383_) == 0)
{
lean_dec(v_x_381_);
return v_x_382_;
}
else
{
lean_object* v_head_384_; lean_object* v_tail_385_; lean_object* v___x_387_; uint8_t v_isShared_388_; uint8_t v_isSharedCheck_397_; 
v_head_384_ = lean_ctor_get(v_x_383_, 0);
v_tail_385_ = lean_ctor_get(v_x_383_, 1);
v_isSharedCheck_397_ = !lean_is_exclusive(v_x_383_);
if (v_isSharedCheck_397_ == 0)
{
v___x_387_ = v_x_383_;
v_isShared_388_ = v_isSharedCheck_397_;
goto v_resetjp_386_;
}
else
{
lean_inc(v_tail_385_);
lean_inc(v_head_384_);
lean_dec(v_x_383_);
v___x_387_ = lean_box(0);
v_isShared_388_ = v_isSharedCheck_397_;
goto v_resetjp_386_;
}
v_resetjp_386_:
{
lean_object* v___x_390_; 
lean_inc(v_x_381_);
if (v_isShared_388_ == 0)
{
lean_ctor_set_tag(v___x_387_, 5);
lean_ctor_set(v___x_387_, 1, v_x_381_);
lean_ctor_set(v___x_387_, 0, v_x_382_);
v___x_390_ = v___x_387_;
goto v_reusejp_389_;
}
else
{
lean_object* v_reuseFailAlloc_396_; 
v_reuseFailAlloc_396_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v_reuseFailAlloc_396_, 0, v_x_382_);
lean_ctor_set(v_reuseFailAlloc_396_, 1, v_x_381_);
v___x_390_ = v_reuseFailAlloc_396_;
goto v_reusejp_389_;
}
v_reusejp_389_:
{
lean_object* v___x_391_; uint8_t v___x_392_; lean_object* v___x_393_; lean_object* v___x_394_; lean_object* v___x_395_; 
v___x_391_ = lean_unsigned_to_nat(0u);
v___x_392_ = lean_unbox(v_head_384_);
lean_dec(v_head_384_);
v___x_393_ = lp_hoba_Hoba_instReprKind_repr(v___x_392_, v___x_391_);
v___x_394_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_394_, 0, v___x_390_);
lean_ctor_set(v___x_394_, 1, v___x_393_);
v___x_395_ = lp_hoba_List_foldl___at___00List_foldl___at___00Std_Format_joinSep___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__0_spec__0_spec__1_spec__5(v_x_381_, v___x_394_, v_tail_385_);
return v___x_395_;
}
}
}
}
}
LEAN_EXPORT lean_object* lp_hoba_Std_Format_joinSep___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__0_spec__0(lean_object* v_x_398_, lean_object* v_x_399_){
_start:
{
if (lean_obj_tag(v_x_398_) == 0)
{
lean_object* v___x_400_; 
lean_dec(v_x_399_);
v___x_400_ = lean_box(0);
return v___x_400_;
}
else
{
lean_object* v_tail_401_; 
v_tail_401_ = lean_ctor_get(v_x_398_, 1);
if (lean_obj_tag(v_tail_401_) == 0)
{
lean_object* v_head_402_; uint8_t v___x_403_; lean_object* v___x_404_; 
lean_dec(v_x_399_);
v_head_402_ = lean_ctor_get(v_x_398_, 0);
lean_inc(v_head_402_);
lean_dec_ref_known(v_x_398_, 2);
v___x_403_ = lean_unbox(v_head_402_);
lean_dec(v_head_402_);
v___x_404_ = lp_hoba_Std_Format_joinSep___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__0_spec__0___lam__0(v___x_403_);
return v___x_404_;
}
else
{
lean_object* v_head_405_; uint8_t v___x_406_; lean_object* v___x_407_; lean_object* v___x_408_; 
lean_inc(v_tail_401_);
v_head_405_ = lean_ctor_get(v_x_398_, 0);
lean_inc(v_head_405_);
lean_dec_ref_known(v_x_398_, 2);
v___x_406_ = lean_unbox(v_head_405_);
lean_dec(v_head_405_);
v___x_407_ = lp_hoba_Std_Format_joinSep___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__0_spec__0___lam__0(v___x_406_);
v___x_408_ = lp_hoba_List_foldl___at___00Std_Format_joinSep___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__0_spec__0_spec__1(v_x_399_, v___x_407_, v_tail_401_);
return v___x_408_;
}
}
}
}
LEAN_EXPORT lean_object* lp_hoba_List_repr___at___00Hoba_instReprMachine_repr_spec__0___redArg(lean_object* v_a_409_){
_start:
{
if (lean_obj_tag(v_a_409_) == 0)
{
lean_object* v___x_410_; 
v___x_410_ = ((lean_object*)(lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__1));
return v___x_410_;
}
else
{
lean_object* v___x_411_; lean_object* v___x_412_; lean_object* v___x_413_; lean_object* v___x_414_; lean_object* v___x_415_; lean_object* v___x_416_; lean_object* v___x_417_; lean_object* v___x_418_; uint8_t v___x_419_; lean_object* v___x_420_; 
v___x_411_ = ((lean_object*)(lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__5));
v___x_412_ = lp_hoba_Std_Format_joinSep___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__0_spec__0(v_a_409_, v___x_411_);
v___x_413_ = lean_obj_once(&lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__8, &lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__8_once, _init_lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__8);
v___x_414_ = ((lean_object*)(lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__9));
v___x_415_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_415_, 0, v___x_414_);
lean_ctor_set(v___x_415_, 1, v___x_412_);
v___x_416_ = ((lean_object*)(lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__10));
v___x_417_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_417_, 0, v___x_415_);
lean_ctor_set(v___x_417_, 1, v___x_416_);
v___x_418_ = lean_alloc_ctor(4, 2, 0);
lean_ctor_set(v___x_418_, 0, v___x_413_);
lean_ctor_set(v___x_418_, 1, v___x_417_);
v___x_419_ = 0;
v___x_420_ = lean_alloc_ctor(6, 1, 1);
lean_ctor_set(v___x_420_, 0, v___x_418_);
lean_ctor_set_uint8(v___x_420_, sizeof(void*)*1, v___x_419_);
return v___x_420_;
}
}
}
static lean_object* _init_lp_hoba_Hoba_instReprMachine_repr___redArg___closed__7(void){
_start:
{
lean_object* v___x_434_; lean_object* v___x_435_; 
v___x_434_ = lean_unsigned_to_nat(5u);
v___x_435_ = lean_nat_to_int(v___x_434_);
return v___x_435_;
}
}
static lean_object* _init_lp_hoba_Hoba_instReprMachine_repr___redArg___closed__10(void){
_start:
{
lean_object* v___x_439_; lean_object* v___x_440_; 
v___x_439_ = lean_unsigned_to_nat(8u);
v___x_440_ = lean_nat_to_int(v___x_439_);
return v___x_440_;
}
}
static lean_object* _init_lp_hoba_Hoba_instReprMachine_repr___redArg___closed__13(void){
_start:
{
lean_object* v___x_444_; lean_object* v___x_445_; 
v___x_444_ = lean_unsigned_to_nat(14u);
v___x_445_ = lean_nat_to_int(v___x_444_);
return v___x_445_;
}
}
static lean_object* _init_lp_hoba_Hoba_instReprMachine_repr___redArg___closed__16(void){
_start:
{
lean_object* v___x_449_; lean_object* v___x_450_; 
v___x_449_ = lean_unsigned_to_nat(9u);
v___x_450_ = lean_nat_to_int(v___x_449_);
return v___x_450_;
}
}
static lean_object* _init_lp_hoba_Hoba_instReprMachine_repr___redArg___closed__20(void){
_start:
{
lean_object* v___x_455_; lean_object* v___x_456_; 
v___x_455_ = ((lean_object*)(lp_hoba_Hoba_instReprMachine_repr___redArg___closed__0));
v___x_456_ = lean_string_length(v___x_455_);
return v___x_456_;
}
}
static lean_object* _init_lp_hoba_Hoba_instReprMachine_repr___redArg___closed__21(void){
_start:
{
lean_object* v___x_457_; lean_object* v___x_458_; 
v___x_457_ = lean_obj_once(&lp_hoba_Hoba_instReprMachine_repr___redArg___closed__20, &lp_hoba_Hoba_instReprMachine_repr___redArg___closed__20_once, _init_lp_hoba_Hoba_instReprMachine_repr___redArg___closed__20);
v___x_458_ = lean_nat_to_int(v___x_457_);
return v___x_458_;
}
}
LEAN_EXPORT lean_object* lp_hoba_Hoba_instReprMachine_repr___redArg(lean_object* v_x_463_){
_start:
{
lean_object* v_n_464_; lean_object* v_kind_465_; lean_object* v_deviations_466_; lean_object* v_edges_467_; lean_object* v_rank_468_; lean_object* v___x_469_; lean_object* v___x_470_; lean_object* v___x_471_; lean_object* v___x_472_; lean_object* v___x_473_; lean_object* v___x_474_; uint8_t v___x_475_; lean_object* v___x_476_; lean_object* v___x_477_; lean_object* v___x_478_; lean_object* v___x_479_; lean_object* v___x_480_; lean_object* v___x_481_; lean_object* v___x_482_; lean_object* v___x_483_; lean_object* v___x_484_; lean_object* v___x_485_; lean_object* v___x_486_; lean_object* v___x_487_; lean_object* v___x_488_; lean_object* v___x_489_; lean_object* v___x_490_; lean_object* v___x_491_; lean_object* v___x_492_; lean_object* v___x_493_; lean_object* v___x_494_; lean_object* v___x_495_; lean_object* v___x_496_; lean_object* v___x_497_; lean_object* v___x_498_; lean_object* v___x_499_; lean_object* v___x_500_; lean_object* v___x_501_; lean_object* v___x_502_; lean_object* v___x_503_; lean_object* v___x_504_; lean_object* v___x_505_; lean_object* v___x_506_; lean_object* v___x_507_; lean_object* v___x_508_; lean_object* v___x_509_; lean_object* v___x_510_; lean_object* v___x_511_; lean_object* v___x_512_; lean_object* v___x_513_; lean_object* v___x_514_; lean_object* v___x_515_; lean_object* v___x_516_; lean_object* v___x_517_; lean_object* v___x_518_; lean_object* v___x_519_; lean_object* v___x_520_; lean_object* v___x_521_; lean_object* v___x_522_; lean_object* v___x_523_; lean_object* v___x_524_; lean_object* v___x_525_; 
v_n_464_ = lean_ctor_get(v_x_463_, 0);
lean_inc(v_n_464_);
v_kind_465_ = lean_ctor_get(v_x_463_, 1);
lean_inc(v_kind_465_);
v_deviations_466_ = lean_ctor_get(v_x_463_, 2);
lean_inc(v_deviations_466_);
v_edges_467_ = lean_ctor_get(v_x_463_, 3);
lean_inc(v_edges_467_);
v_rank_468_ = lean_ctor_get(v_x_463_, 4);
lean_inc(v_rank_468_);
lean_dec_ref(v_x_463_);
v___x_469_ = ((lean_object*)(lp_hoba_Hoba_instReprMachine_repr___redArg___closed__5));
v___x_470_ = ((lean_object*)(lp_hoba_Hoba_instReprMachine_repr___redArg___closed__6));
v___x_471_ = lean_obj_once(&lp_hoba_Hoba_instReprMachine_repr___redArg___closed__7, &lp_hoba_Hoba_instReprMachine_repr___redArg___closed__7_once, _init_lp_hoba_Hoba_instReprMachine_repr___redArg___closed__7);
v___x_472_ = l_Nat_reprFast(v_n_464_);
v___x_473_ = lean_alloc_ctor(3, 1, 0);
lean_ctor_set(v___x_473_, 0, v___x_472_);
v___x_474_ = lean_alloc_ctor(4, 2, 0);
lean_ctor_set(v___x_474_, 0, v___x_471_);
lean_ctor_set(v___x_474_, 1, v___x_473_);
v___x_475_ = 0;
v___x_476_ = lean_alloc_ctor(6, 1, 1);
lean_ctor_set(v___x_476_, 0, v___x_474_);
lean_ctor_set_uint8(v___x_476_, sizeof(void*)*1, v___x_475_);
v___x_477_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_477_, 0, v___x_470_);
lean_ctor_set(v___x_477_, 1, v___x_476_);
v___x_478_ = ((lean_object*)(lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__4));
v___x_479_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_479_, 0, v___x_477_);
lean_ctor_set(v___x_479_, 1, v___x_478_);
v___x_480_ = lean_box(1);
v___x_481_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_481_, 0, v___x_479_);
lean_ctor_set(v___x_481_, 1, v___x_480_);
v___x_482_ = ((lean_object*)(lp_hoba_Hoba_instReprMachine_repr___redArg___closed__9));
v___x_483_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_483_, 0, v___x_481_);
lean_ctor_set(v___x_483_, 1, v___x_482_);
v___x_484_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_484_, 0, v___x_483_);
lean_ctor_set(v___x_484_, 1, v___x_469_);
v___x_485_ = lean_obj_once(&lp_hoba_Hoba_instReprMachine_repr___redArg___closed__10, &lp_hoba_Hoba_instReprMachine_repr___redArg___closed__10_once, _init_lp_hoba_Hoba_instReprMachine_repr___redArg___closed__10);
v___x_486_ = lp_hoba_List_repr___at___00Hoba_instReprMachine_repr_spec__0___redArg(v_kind_465_);
v___x_487_ = lean_alloc_ctor(4, 2, 0);
lean_ctor_set(v___x_487_, 0, v___x_485_);
lean_ctor_set(v___x_487_, 1, v___x_486_);
v___x_488_ = lean_alloc_ctor(6, 1, 1);
lean_ctor_set(v___x_488_, 0, v___x_487_);
lean_ctor_set_uint8(v___x_488_, sizeof(void*)*1, v___x_475_);
v___x_489_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_489_, 0, v___x_484_);
lean_ctor_set(v___x_489_, 1, v___x_488_);
v___x_490_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_490_, 0, v___x_489_);
lean_ctor_set(v___x_490_, 1, v___x_478_);
v___x_491_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_491_, 0, v___x_490_);
lean_ctor_set(v___x_491_, 1, v___x_480_);
v___x_492_ = ((lean_object*)(lp_hoba_Hoba_instReprMachine_repr___redArg___closed__12));
v___x_493_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_493_, 0, v___x_491_);
lean_ctor_set(v___x_493_, 1, v___x_492_);
v___x_494_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_494_, 0, v___x_493_);
lean_ctor_set(v___x_494_, 1, v___x_469_);
v___x_495_ = lean_obj_once(&lp_hoba_Hoba_instReprMachine_repr___redArg___closed__13, &lp_hoba_Hoba_instReprMachine_repr___redArg___closed__13_once, _init_lp_hoba_Hoba_instReprMachine_repr___redArg___closed__13);
v___x_496_ = lp_hoba_List_repr___at___00Hoba_instReprMachine_repr_spec__1___redArg(v_deviations_466_);
v___x_497_ = lean_alloc_ctor(4, 2, 0);
lean_ctor_set(v___x_497_, 0, v___x_495_);
lean_ctor_set(v___x_497_, 1, v___x_496_);
v___x_498_ = lean_alloc_ctor(6, 1, 1);
lean_ctor_set(v___x_498_, 0, v___x_497_);
lean_ctor_set_uint8(v___x_498_, sizeof(void*)*1, v___x_475_);
v___x_499_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_499_, 0, v___x_494_);
lean_ctor_set(v___x_499_, 1, v___x_498_);
v___x_500_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_500_, 0, v___x_499_);
lean_ctor_set(v___x_500_, 1, v___x_478_);
v___x_501_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_501_, 0, v___x_500_);
lean_ctor_set(v___x_501_, 1, v___x_480_);
v___x_502_ = ((lean_object*)(lp_hoba_Hoba_instReprMachine_repr___redArg___closed__15));
v___x_503_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_503_, 0, v___x_501_);
lean_ctor_set(v___x_503_, 1, v___x_502_);
v___x_504_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_504_, 0, v___x_503_);
lean_ctor_set(v___x_504_, 1, v___x_469_);
v___x_505_ = lean_obj_once(&lp_hoba_Hoba_instReprMachine_repr___redArg___closed__16, &lp_hoba_Hoba_instReprMachine_repr___redArg___closed__16_once, _init_lp_hoba_Hoba_instReprMachine_repr___redArg___closed__16);
v___x_506_ = lp_hoba_List_repr___at___00Hoba_instReprMachine_repr_spec__2___redArg(v_edges_467_);
v___x_507_ = lean_alloc_ctor(4, 2, 0);
lean_ctor_set(v___x_507_, 0, v___x_505_);
lean_ctor_set(v___x_507_, 1, v___x_506_);
v___x_508_ = lean_alloc_ctor(6, 1, 1);
lean_ctor_set(v___x_508_, 0, v___x_507_);
lean_ctor_set_uint8(v___x_508_, sizeof(void*)*1, v___x_475_);
v___x_509_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_509_, 0, v___x_504_);
lean_ctor_set(v___x_509_, 1, v___x_508_);
v___x_510_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_510_, 0, v___x_509_);
lean_ctor_set(v___x_510_, 1, v___x_478_);
v___x_511_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_511_, 0, v___x_510_);
lean_ctor_set(v___x_511_, 1, v___x_480_);
v___x_512_ = ((lean_object*)(lp_hoba_Hoba_instReprMachine_repr___redArg___closed__18));
v___x_513_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_513_, 0, v___x_511_);
lean_ctor_set(v___x_513_, 1, v___x_512_);
v___x_514_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_514_, 0, v___x_513_);
lean_ctor_set(v___x_514_, 1, v___x_469_);
v___x_515_ = lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg(v_rank_468_);
v___x_516_ = lean_alloc_ctor(4, 2, 0);
lean_ctor_set(v___x_516_, 0, v___x_485_);
lean_ctor_set(v___x_516_, 1, v___x_515_);
v___x_517_ = lean_alloc_ctor(6, 1, 1);
lean_ctor_set(v___x_517_, 0, v___x_516_);
lean_ctor_set_uint8(v___x_517_, sizeof(void*)*1, v___x_475_);
v___x_518_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_518_, 0, v___x_514_);
lean_ctor_set(v___x_518_, 1, v___x_517_);
v___x_519_ = lean_obj_once(&lp_hoba_Hoba_instReprMachine_repr___redArg___closed__21, &lp_hoba_Hoba_instReprMachine_repr___redArg___closed__21_once, _init_lp_hoba_Hoba_instReprMachine_repr___redArg___closed__21);
v___x_520_ = ((lean_object*)(lp_hoba_Hoba_instReprMachine_repr___redArg___closed__22));
v___x_521_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_521_, 0, v___x_520_);
lean_ctor_set(v___x_521_, 1, v___x_518_);
v___x_522_ = ((lean_object*)(lp_hoba_Hoba_instReprMachine_repr___redArg___closed__23));
v___x_523_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_523_, 0, v___x_521_);
lean_ctor_set(v___x_523_, 1, v___x_522_);
v___x_524_ = lean_alloc_ctor(4, 2, 0);
lean_ctor_set(v___x_524_, 0, v___x_519_);
lean_ctor_set(v___x_524_, 1, v___x_523_);
v___x_525_ = lean_alloc_ctor(6, 1, 1);
lean_ctor_set(v___x_525_, 0, v___x_524_);
lean_ctor_set_uint8(v___x_525_, sizeof(void*)*1, v___x_475_);
return v___x_525_;
}
}
LEAN_EXPORT lean_object* lp_hoba_Hoba_instReprMachine_repr(lean_object* v_x_526_, lean_object* v_prec_527_){
_start:
{
lean_object* v___x_528_; 
v___x_528_ = lp_hoba_Hoba_instReprMachine_repr___redArg(v_x_526_);
return v___x_528_;
}
}
LEAN_EXPORT lean_object* lp_hoba_Hoba_instReprMachine_repr___boxed(lean_object* v_x_529_, lean_object* v_prec_530_){
_start:
{
lean_object* v_res_531_; 
v_res_531_ = lp_hoba_Hoba_instReprMachine_repr(v_x_529_, v_prec_530_);
lean_dec(v_prec_530_);
return v_res_531_;
}
}
LEAN_EXPORT lean_object* lp_hoba_List_repr___at___00Hoba_instReprMachine_repr_spec__0(lean_object* v_a_532_, lean_object* v_n_533_){
_start:
{
lean_object* v___x_534_; 
v___x_534_ = lp_hoba_List_repr___at___00Hoba_instReprMachine_repr_spec__0___redArg(v_a_532_);
return v___x_534_;
}
}
LEAN_EXPORT lean_object* lp_hoba_List_repr___at___00Hoba_instReprMachine_repr_spec__0___boxed(lean_object* v_a_535_, lean_object* v_n_536_){
_start:
{
lean_object* v_res_537_; 
v_res_537_ = lp_hoba_List_repr___at___00Hoba_instReprMachine_repr_spec__0(v_a_535_, v_n_536_);
lean_dec(v_n_536_);
return v_res_537_;
}
}
LEAN_EXPORT lean_object* lp_hoba_List_repr___at___00Hoba_instReprMachine_repr_spec__1(lean_object* v_a_538_, lean_object* v_n_539_){
_start:
{
lean_object* v___x_540_; 
v___x_540_ = lp_hoba_List_repr___at___00Hoba_instReprMachine_repr_spec__1___redArg(v_a_538_);
return v___x_540_;
}
}
LEAN_EXPORT lean_object* lp_hoba_List_repr___at___00Hoba_instReprMachine_repr_spec__1___boxed(lean_object* v_a_541_, lean_object* v_n_542_){
_start:
{
lean_object* v_res_543_; 
v_res_543_ = lp_hoba_List_repr___at___00Hoba_instReprMachine_repr_spec__1(v_a_541_, v_n_542_);
lean_dec(v_n_542_);
return v_res_543_;
}
}
LEAN_EXPORT lean_object* lp_hoba_List_repr___at___00Hoba_instReprMachine_repr_spec__2(lean_object* v_a_544_, lean_object* v_n_545_){
_start:
{
lean_object* v___x_546_; 
v___x_546_ = lp_hoba_List_repr___at___00Hoba_instReprMachine_repr_spec__2___redArg(v_a_544_);
return v___x_546_;
}
}
LEAN_EXPORT lean_object* lp_hoba_List_repr___at___00Hoba_instReprMachine_repr_spec__2___boxed(lean_object* v_a_547_, lean_object* v_n_548_){
_start:
{
lean_object* v_res_549_; 
v_res_549_ = lp_hoba_List_repr___at___00Hoba_instReprMachine_repr_spec__2(v_a_547_, v_n_548_);
lean_dec(v_n_548_);
return v_res_549_;
}
}
LEAN_EXPORT lean_object* lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3(lean_object* v_a_550_, lean_object* v_n_551_){
_start:
{
lean_object* v___x_552_; 
v___x_552_ = lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg(v_a_550_);
return v___x_552_;
}
}
LEAN_EXPORT lean_object* lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___boxed(lean_object* v_a_553_, lean_object* v_n_554_){
_start:
{
lean_object* v_res_555_; 
v_res_555_ = lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3(v_a_553_, v_n_554_);
lean_dec(v_n_554_);
return v_res_555_;
}
}
LEAN_EXPORT lean_object* lp_hoba_Prod_repr___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__2_spec__4(lean_object* v_x_556_, lean_object* v_x_557_){
_start:
{
lean_object* v___x_558_; 
v___x_558_ = lp_hoba_Prod_repr___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__2_spec__4___redArg(v_x_556_);
return v___x_558_;
}
}
LEAN_EXPORT lean_object* lp_hoba_Prod_repr___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__2_spec__4___boxed(lean_object* v_x_559_, lean_object* v_x_560_){
_start:
{
lean_object* v_res_561_; 
v_res_561_ = lp_hoba_Prod_repr___at___00List_repr___at___00Hoba_instReprMachine_repr_spec__2_spec__4(v_x_559_, v_x_560_);
lean_dec(v_x_560_);
return v_res_561_;
}
}
static lean_object* _init_lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__4(void){
_start:
{
lean_object* v___x_573_; lean_object* v___x_574_; 
v___x_573_ = lean_unsigned_to_nat(18u);
v___x_574_ = lean_nat_to_int(v___x_573_);
return v___x_574_;
}
}
static lean_object* _init_lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__7(void){
_start:
{
lean_object* v___x_578_; lean_object* v___x_579_; 
v___x_578_ = lean_unsigned_to_nat(16u);
v___x_579_ = lean_nat_to_int(v___x_578_);
return v___x_579_;
}
}
static lean_object* _init_lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__10(void){
_start:
{
lean_object* v___x_583_; lean_object* v___x_584_; 
v___x_583_ = lean_unsigned_to_nat(15u);
v___x_584_ = lean_nat_to_int(v___x_583_);
return v___x_584_;
}
}
static lean_object* _init_lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__13(void){
_start:
{
lean_object* v___x_588_; lean_object* v___x_589_; 
v___x_588_ = lean_unsigned_to_nat(13u);
v___x_589_ = lean_nat_to_int(v___x_588_);
return v___x_589_;
}
}
static lean_object* _init_lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__16(void){
_start:
{
lean_object* v___x_593_; lean_object* v___x_594_; 
v___x_593_ = lean_unsigned_to_nat(25u);
v___x_594_ = lean_nat_to_int(v___x_593_);
return v___x_594_;
}
}
static lean_object* _init_lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__19(void){
_start:
{
lean_object* v___x_598_; lean_object* v___x_599_; 
v___x_598_ = lean_unsigned_to_nat(27u);
v___x_599_ = lean_nat_to_int(v___x_598_);
return v___x_599_;
}
}
static lean_object* _init_lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__22(void){
_start:
{
lean_object* v___x_603_; lean_object* v___x_604_; 
v___x_603_ = lean_unsigned_to_nat(19u);
v___x_604_ = lean_nat_to_int(v___x_603_);
return v___x_604_;
}
}
LEAN_EXPORT lean_object* lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg(lean_object* v_x_605_){
_start:
{
lean_object* v_conditionCount_606_; lean_object* v_processCount_607_; lean_object* v_recordCount_608_; lean_object* v_flowCount_609_; lean_object* v_barrierConditionCount_610_; lean_object* v_mechanismConditionCount_611_; lean_object* v_eventClassCount_612_; lean_object* v___x_613_; lean_object* v___x_614_; lean_object* v___x_615_; lean_object* v___x_616_; lean_object* v___x_617_; lean_object* v___x_618_; uint8_t v___x_619_; lean_object* v___x_620_; lean_object* v___x_621_; lean_object* v___x_622_; lean_object* v___x_623_; lean_object* v___x_624_; lean_object* v___x_625_; lean_object* v___x_626_; lean_object* v___x_627_; lean_object* v___x_628_; lean_object* v___x_629_; lean_object* v___x_630_; lean_object* v___x_631_; lean_object* v___x_632_; lean_object* v___x_633_; lean_object* v___x_634_; lean_object* v___x_635_; lean_object* v___x_636_; lean_object* v___x_637_; lean_object* v___x_638_; lean_object* v___x_639_; lean_object* v___x_640_; lean_object* v___x_641_; lean_object* v___x_642_; lean_object* v___x_643_; lean_object* v___x_644_; lean_object* v___x_645_; lean_object* v___x_646_; lean_object* v___x_647_; lean_object* v___x_648_; lean_object* v___x_649_; lean_object* v___x_650_; lean_object* v___x_651_; lean_object* v___x_652_; lean_object* v___x_653_; lean_object* v___x_654_; lean_object* v___x_655_; lean_object* v___x_656_; lean_object* v___x_657_; lean_object* v___x_658_; lean_object* v___x_659_; lean_object* v___x_660_; lean_object* v___x_661_; lean_object* v___x_662_; lean_object* v___x_663_; lean_object* v___x_664_; lean_object* v___x_665_; lean_object* v___x_666_; lean_object* v___x_667_; lean_object* v___x_668_; lean_object* v___x_669_; lean_object* v___x_670_; lean_object* v___x_671_; lean_object* v___x_672_; lean_object* v___x_673_; lean_object* v___x_674_; lean_object* v___x_675_; lean_object* v___x_676_; lean_object* v___x_677_; lean_object* v___x_678_; lean_object* v___x_679_; lean_object* v___x_680_; lean_object* v___x_681_; lean_object* v___x_682_; lean_object* v___x_683_; lean_object* v___x_684_; lean_object* v___x_685_; lean_object* v___x_686_; lean_object* v___x_687_; lean_object* v___x_688_; lean_object* v___x_689_; lean_object* v___x_690_; lean_object* v___x_691_; lean_object* v___x_692_; lean_object* v___x_693_; lean_object* v___x_694_; lean_object* v___x_695_; lean_object* v___x_696_; 
v_conditionCount_606_ = lean_ctor_get(v_x_605_, 0);
lean_inc(v_conditionCount_606_);
v_processCount_607_ = lean_ctor_get(v_x_605_, 1);
lean_inc(v_processCount_607_);
v_recordCount_608_ = lean_ctor_get(v_x_605_, 2);
lean_inc(v_recordCount_608_);
v_flowCount_609_ = lean_ctor_get(v_x_605_, 3);
lean_inc(v_flowCount_609_);
v_barrierConditionCount_610_ = lean_ctor_get(v_x_605_, 4);
lean_inc(v_barrierConditionCount_610_);
v_mechanismConditionCount_611_ = lean_ctor_get(v_x_605_, 5);
lean_inc(v_mechanismConditionCount_611_);
v_eventClassCount_612_ = lean_ctor_get(v_x_605_, 6);
lean_inc(v_eventClassCount_612_);
lean_dec_ref(v_x_605_);
v___x_613_ = ((lean_object*)(lp_hoba_Hoba_instReprMachine_repr___redArg___closed__5));
v___x_614_ = ((lean_object*)(lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__3));
v___x_615_ = lean_obj_once(&lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__4, &lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__4_once, _init_lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__4);
v___x_616_ = l_Nat_reprFast(v_conditionCount_606_);
v___x_617_ = lean_alloc_ctor(3, 1, 0);
lean_ctor_set(v___x_617_, 0, v___x_616_);
v___x_618_ = lean_alloc_ctor(4, 2, 0);
lean_ctor_set(v___x_618_, 0, v___x_615_);
lean_ctor_set(v___x_618_, 1, v___x_617_);
v___x_619_ = 0;
v___x_620_ = lean_alloc_ctor(6, 1, 1);
lean_ctor_set(v___x_620_, 0, v___x_618_);
lean_ctor_set_uint8(v___x_620_, sizeof(void*)*1, v___x_619_);
v___x_621_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_621_, 0, v___x_614_);
lean_ctor_set(v___x_621_, 1, v___x_620_);
v___x_622_ = ((lean_object*)(lp_hoba_List_repr_x27___at___00Hoba_instReprMachine_repr_spec__3___redArg___closed__4));
v___x_623_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_623_, 0, v___x_621_);
lean_ctor_set(v___x_623_, 1, v___x_622_);
v___x_624_ = lean_box(1);
v___x_625_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_625_, 0, v___x_623_);
lean_ctor_set(v___x_625_, 1, v___x_624_);
v___x_626_ = ((lean_object*)(lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__6));
v___x_627_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_627_, 0, v___x_625_);
lean_ctor_set(v___x_627_, 1, v___x_626_);
v___x_628_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_628_, 0, v___x_627_);
lean_ctor_set(v___x_628_, 1, v___x_613_);
v___x_629_ = lean_obj_once(&lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__7, &lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__7_once, _init_lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__7);
v___x_630_ = l_Nat_reprFast(v_processCount_607_);
v___x_631_ = lean_alloc_ctor(3, 1, 0);
lean_ctor_set(v___x_631_, 0, v___x_630_);
v___x_632_ = lean_alloc_ctor(4, 2, 0);
lean_ctor_set(v___x_632_, 0, v___x_629_);
lean_ctor_set(v___x_632_, 1, v___x_631_);
v___x_633_ = lean_alloc_ctor(6, 1, 1);
lean_ctor_set(v___x_633_, 0, v___x_632_);
lean_ctor_set_uint8(v___x_633_, sizeof(void*)*1, v___x_619_);
v___x_634_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_634_, 0, v___x_628_);
lean_ctor_set(v___x_634_, 1, v___x_633_);
v___x_635_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_635_, 0, v___x_634_);
lean_ctor_set(v___x_635_, 1, v___x_622_);
v___x_636_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_636_, 0, v___x_635_);
lean_ctor_set(v___x_636_, 1, v___x_624_);
v___x_637_ = ((lean_object*)(lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__9));
v___x_638_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_638_, 0, v___x_636_);
lean_ctor_set(v___x_638_, 1, v___x_637_);
v___x_639_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_639_, 0, v___x_638_);
lean_ctor_set(v___x_639_, 1, v___x_613_);
v___x_640_ = lean_obj_once(&lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__10, &lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__10_once, _init_lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__10);
v___x_641_ = l_Nat_reprFast(v_recordCount_608_);
v___x_642_ = lean_alloc_ctor(3, 1, 0);
lean_ctor_set(v___x_642_, 0, v___x_641_);
v___x_643_ = lean_alloc_ctor(4, 2, 0);
lean_ctor_set(v___x_643_, 0, v___x_640_);
lean_ctor_set(v___x_643_, 1, v___x_642_);
v___x_644_ = lean_alloc_ctor(6, 1, 1);
lean_ctor_set(v___x_644_, 0, v___x_643_);
lean_ctor_set_uint8(v___x_644_, sizeof(void*)*1, v___x_619_);
v___x_645_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_645_, 0, v___x_639_);
lean_ctor_set(v___x_645_, 1, v___x_644_);
v___x_646_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_646_, 0, v___x_645_);
lean_ctor_set(v___x_646_, 1, v___x_622_);
v___x_647_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_647_, 0, v___x_646_);
lean_ctor_set(v___x_647_, 1, v___x_624_);
v___x_648_ = ((lean_object*)(lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__12));
v___x_649_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_649_, 0, v___x_647_);
lean_ctor_set(v___x_649_, 1, v___x_648_);
v___x_650_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_650_, 0, v___x_649_);
lean_ctor_set(v___x_650_, 1, v___x_613_);
v___x_651_ = lean_obj_once(&lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__13, &lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__13_once, _init_lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__13);
v___x_652_ = l_Nat_reprFast(v_flowCount_609_);
v___x_653_ = lean_alloc_ctor(3, 1, 0);
lean_ctor_set(v___x_653_, 0, v___x_652_);
v___x_654_ = lean_alloc_ctor(4, 2, 0);
lean_ctor_set(v___x_654_, 0, v___x_651_);
lean_ctor_set(v___x_654_, 1, v___x_653_);
v___x_655_ = lean_alloc_ctor(6, 1, 1);
lean_ctor_set(v___x_655_, 0, v___x_654_);
lean_ctor_set_uint8(v___x_655_, sizeof(void*)*1, v___x_619_);
v___x_656_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_656_, 0, v___x_650_);
lean_ctor_set(v___x_656_, 1, v___x_655_);
v___x_657_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_657_, 0, v___x_656_);
lean_ctor_set(v___x_657_, 1, v___x_622_);
v___x_658_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_658_, 0, v___x_657_);
lean_ctor_set(v___x_658_, 1, v___x_624_);
v___x_659_ = ((lean_object*)(lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__15));
v___x_660_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_660_, 0, v___x_658_);
lean_ctor_set(v___x_660_, 1, v___x_659_);
v___x_661_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_661_, 0, v___x_660_);
lean_ctor_set(v___x_661_, 1, v___x_613_);
v___x_662_ = lean_obj_once(&lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__16, &lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__16_once, _init_lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__16);
v___x_663_ = l_Nat_reprFast(v_barrierConditionCount_610_);
v___x_664_ = lean_alloc_ctor(3, 1, 0);
lean_ctor_set(v___x_664_, 0, v___x_663_);
v___x_665_ = lean_alloc_ctor(4, 2, 0);
lean_ctor_set(v___x_665_, 0, v___x_662_);
lean_ctor_set(v___x_665_, 1, v___x_664_);
v___x_666_ = lean_alloc_ctor(6, 1, 1);
lean_ctor_set(v___x_666_, 0, v___x_665_);
lean_ctor_set_uint8(v___x_666_, sizeof(void*)*1, v___x_619_);
v___x_667_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_667_, 0, v___x_661_);
lean_ctor_set(v___x_667_, 1, v___x_666_);
v___x_668_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_668_, 0, v___x_667_);
lean_ctor_set(v___x_668_, 1, v___x_622_);
v___x_669_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_669_, 0, v___x_668_);
lean_ctor_set(v___x_669_, 1, v___x_624_);
v___x_670_ = ((lean_object*)(lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__18));
v___x_671_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_671_, 0, v___x_669_);
lean_ctor_set(v___x_671_, 1, v___x_670_);
v___x_672_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_672_, 0, v___x_671_);
lean_ctor_set(v___x_672_, 1, v___x_613_);
v___x_673_ = lean_obj_once(&lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__19, &lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__19_once, _init_lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__19);
v___x_674_ = l_Nat_reprFast(v_mechanismConditionCount_611_);
v___x_675_ = lean_alloc_ctor(3, 1, 0);
lean_ctor_set(v___x_675_, 0, v___x_674_);
v___x_676_ = lean_alloc_ctor(4, 2, 0);
lean_ctor_set(v___x_676_, 0, v___x_673_);
lean_ctor_set(v___x_676_, 1, v___x_675_);
v___x_677_ = lean_alloc_ctor(6, 1, 1);
lean_ctor_set(v___x_677_, 0, v___x_676_);
lean_ctor_set_uint8(v___x_677_, sizeof(void*)*1, v___x_619_);
v___x_678_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_678_, 0, v___x_672_);
lean_ctor_set(v___x_678_, 1, v___x_677_);
v___x_679_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_679_, 0, v___x_678_);
lean_ctor_set(v___x_679_, 1, v___x_622_);
v___x_680_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_680_, 0, v___x_679_);
lean_ctor_set(v___x_680_, 1, v___x_624_);
v___x_681_ = ((lean_object*)(lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__21));
v___x_682_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_682_, 0, v___x_680_);
lean_ctor_set(v___x_682_, 1, v___x_681_);
v___x_683_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_683_, 0, v___x_682_);
lean_ctor_set(v___x_683_, 1, v___x_613_);
v___x_684_ = lean_obj_once(&lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__22, &lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__22_once, _init_lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg___closed__22);
v___x_685_ = l_Nat_reprFast(v_eventClassCount_612_);
v___x_686_ = lean_alloc_ctor(3, 1, 0);
lean_ctor_set(v___x_686_, 0, v___x_685_);
v___x_687_ = lean_alloc_ctor(4, 2, 0);
lean_ctor_set(v___x_687_, 0, v___x_684_);
lean_ctor_set(v___x_687_, 1, v___x_686_);
v___x_688_ = lean_alloc_ctor(6, 1, 1);
lean_ctor_set(v___x_688_, 0, v___x_687_);
lean_ctor_set_uint8(v___x_688_, sizeof(void*)*1, v___x_619_);
v___x_689_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_689_, 0, v___x_683_);
lean_ctor_set(v___x_689_, 1, v___x_688_);
v___x_690_ = lean_obj_once(&lp_hoba_Hoba_instReprMachine_repr___redArg___closed__21, &lp_hoba_Hoba_instReprMachine_repr___redArg___closed__21_once, _init_lp_hoba_Hoba_instReprMachine_repr___redArg___closed__21);
v___x_691_ = ((lean_object*)(lp_hoba_Hoba_instReprMachine_repr___redArg___closed__22));
v___x_692_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_692_, 0, v___x_691_);
lean_ctor_set(v___x_692_, 1, v___x_689_);
v___x_693_ = ((lean_object*)(lp_hoba_Hoba_instReprMachine_repr___redArg___closed__23));
v___x_694_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_694_, 0, v___x_692_);
lean_ctor_set(v___x_694_, 1, v___x_693_);
v___x_695_ = lean_alloc_ctor(4, 2, 0);
lean_ctor_set(v___x_695_, 0, v___x_690_);
lean_ctor_set(v___x_695_, 1, v___x_694_);
v___x_696_ = lean_alloc_ctor(6, 1, 1);
lean_ctor_set(v___x_696_, 0, v___x_695_);
lean_ctor_set_uint8(v___x_696_, sizeof(void*)*1, v___x_619_);
return v___x_696_;
}
}
LEAN_EXPORT lean_object* lp_hoba_Hoba_instReprSubstrateSummary_repr(lean_object* v_x_697_, lean_object* v_prec_698_){
_start:
{
lean_object* v___x_699_; 
v___x_699_ = lp_hoba_Hoba_instReprSubstrateSummary_repr___redArg(v_x_697_);
return v___x_699_;
}
}
LEAN_EXPORT lean_object* lp_hoba_Hoba_instReprSubstrateSummary_repr___boxed(lean_object* v_x_700_, lean_object* v_prec_701_){
_start:
{
lean_object* v_res_702_; 
v_res_702_ = lp_hoba_Hoba_instReprSubstrateSummary_repr(v_x_700_, v_prec_701_);
lean_dec(v_prec_701_);
return v_res_702_;
}
}
LEAN_EXPORT lean_object* lp_hoba_Hoba_Machine_rankOf(lean_object* v_m_705_, lean_object* v_s_706_){
_start:
{
lean_object* v_rank_707_; lean_object* v___x_708_; lean_object* v___x_709_; 
v_rank_707_ = lean_ctor_get(v_m_705_, 4);
v___x_708_ = lean_unsigned_to_nat(0u);
v___x_709_ = l_List_getD___redArg(v_rank_707_, v_s_706_, v___x_708_);
return v___x_709_;
}
}
LEAN_EXPORT lean_object* lp_hoba_Hoba_Machine_rankOf___boxed(lean_object* v_m_710_, lean_object* v_s_711_){
_start:
{
lean_object* v_res_712_; 
v_res_712_ = lp_hoba_Hoba_Machine_rankOf(v_m_710_, v_s_711_);
lean_dec_ref(v_m_710_);
return v_res_712_;
}
}
LEAN_EXPORT uint8_t lp_hoba_Hoba_Machine_kindOf(lean_object* v_m_713_, lean_object* v_s_714_){
_start:
{
lean_object* v_kind_715_; uint8_t v___x_716_; lean_object* v___x_717_; lean_object* v___x_718_; uint8_t v___x_719_; 
v_kind_715_ = lean_ctor_get(v_m_713_, 1);
v___x_716_ = 1;
v___x_717_ = lean_box(v___x_716_);
v___x_718_ = l_List_getD___redArg(v_kind_715_, v_s_714_, v___x_717_);
lean_dec(v___x_717_);
v___x_719_ = lean_unbox(v___x_718_);
lean_dec(v___x_718_);
return v___x_719_;
}
}
LEAN_EXPORT lean_object* lp_hoba_Hoba_Machine_kindOf___boxed(lean_object* v_m_720_, lean_object* v_s_721_){
_start:
{
uint8_t v_res_722_; lean_object* v_r_723_; 
v_res_722_ = lp_hoba_Hoba_Machine_kindOf(v_m_720_, v_s_721_);
lean_dec_ref(v_m_720_);
v_r_723_ = lean_box(v_res_722_);
return v_r_723_;
}
}
LEAN_EXPORT lean_object* lp_hoba_Hoba_Machine_states(lean_object* v_m_724_){
_start:
{
lean_object* v_n_725_; lean_object* v___x_726_; 
v_n_725_ = lean_ctor_get(v_m_724_, 0);
lean_inc(v_n_725_);
lean_dec_ref(v_m_724_);
v___x_726_ = l_List_range(v_n_725_);
return v___x_726_;
}
}
LEAN_EXPORT lean_object* lp_hoba_List_filterMapTR_go___at___00Hoba_Machine_exits_spec__0(lean_object* v_s_727_, lean_object* v_a_728_, lean_object* v_a_729_){
_start:
{
if (lean_obj_tag(v_a_728_) == 0)
{
lean_object* v___x_730_; 
v___x_730_ = lean_array_to_list(v_a_729_);
return v___x_730_;
}
else
{
lean_object* v_head_731_; lean_object* v_tail_732_; lean_object* v_fst_733_; lean_object* v_snd_734_; uint8_t v___x_735_; 
v_head_731_ = lean_ctor_get(v_a_728_, 0);
lean_inc(v_head_731_);
v_tail_732_ = lean_ctor_get(v_a_728_, 1);
lean_inc(v_tail_732_);
lean_dec_ref_known(v_a_728_, 2);
v_fst_733_ = lean_ctor_get(v_head_731_, 0);
lean_inc(v_fst_733_);
v_snd_734_ = lean_ctor_get(v_head_731_, 1);
lean_inc(v_snd_734_);
lean_dec(v_head_731_);
v___x_735_ = lean_nat_dec_eq(v_fst_733_, v_s_727_);
lean_dec(v_fst_733_);
if (v___x_735_ == 0)
{
lean_dec(v_snd_734_);
v_a_728_ = v_tail_732_;
goto _start;
}
else
{
lean_object* v___x_737_; 
v___x_737_ = lean_array_push(v_a_729_, v_snd_734_);
v_a_728_ = v_tail_732_;
v_a_729_ = v___x_737_;
goto _start;
}
}
}
}
LEAN_EXPORT lean_object* lp_hoba_List_filterMapTR_go___at___00Hoba_Machine_exits_spec__0___boxed(lean_object* v_s_739_, lean_object* v_a_740_, lean_object* v_a_741_){
_start:
{
lean_object* v_res_742_; 
v_res_742_ = lp_hoba_List_filterMapTR_go___at___00Hoba_Machine_exits_spec__0(v_s_739_, v_a_740_, v_a_741_);
lean_dec(v_s_739_);
return v_res_742_;
}
}
LEAN_EXPORT lean_object* lp_hoba_Hoba_Machine_exits(lean_object* v_m_745_, lean_object* v_s_746_){
_start:
{
lean_object* v_edges_747_; lean_object* v___x_748_; lean_object* v___x_749_; 
v_edges_747_ = lean_ctor_get(v_m_745_, 3);
lean_inc(v_edges_747_);
lean_dec_ref(v_m_745_);
v___x_748_ = ((lean_object*)(lp_hoba_Hoba_Machine_exits___closed__0));
v___x_749_ = lp_hoba_List_filterMapTR_go___at___00Hoba_Machine_exits_spec__0(v_s_746_, v_edges_747_, v___x_748_);
return v___x_749_;
}
}
LEAN_EXPORT lean_object* lp_hoba_Hoba_Machine_exits___boxed(lean_object* v_m_750_, lean_object* v_s_751_){
_start:
{
lean_object* v_res_752_; 
v_res_752_ = lp_hoba_Hoba_Machine_exits(v_m_750_, v_s_751_);
lean_dec(v_s_751_);
return v_res_752_;
}
}
LEAN_EXPORT uint8_t lp_hoba_List_all___at___00Hoba_Machine_WellFormed_spec__0(lean_object* v_m_753_, lean_object* v_x_754_){
_start:
{
if (lean_obj_tag(v_x_754_) == 0)
{
uint8_t v___x_755_; 
v___x_755_ = 1;
return v___x_755_;
}
else
{
lean_object* v_head_756_; lean_object* v_tail_757_; uint8_t v___y_759_; lean_object* v_fst_761_; lean_object* v_snd_762_; lean_object* v_n_763_; uint8_t v___x_764_; 
v_head_756_ = lean_ctor_get(v_x_754_, 0);
v_tail_757_ = lean_ctor_get(v_x_754_, 1);
v_fst_761_ = lean_ctor_get(v_head_756_, 0);
v_snd_762_ = lean_ctor_get(v_head_756_, 1);
v_n_763_ = lean_ctor_get(v_m_753_, 0);
v___x_764_ = lean_nat_dec_lt(v_fst_761_, v_n_763_);
if (v___x_764_ == 0)
{
v___y_759_ = v___x_764_;
goto v___jp_758_;
}
else
{
uint8_t v___x_765_; 
v___x_765_ = lean_nat_dec_lt(v_snd_762_, v_n_763_);
v___y_759_ = v___x_765_;
goto v___jp_758_;
}
v___jp_758_:
{
if (v___y_759_ == 0)
{
return v___y_759_;
}
else
{
v_x_754_ = v_tail_757_;
goto _start;
}
}
}
}
}
LEAN_EXPORT lean_object* lp_hoba_List_all___at___00Hoba_Machine_WellFormed_spec__0___boxed(lean_object* v_m_766_, lean_object* v_x_767_){
_start:
{
uint8_t v_res_768_; lean_object* v_r_769_; 
v_res_768_ = lp_hoba_List_all___at___00Hoba_Machine_WellFormed_spec__0(v_m_766_, v_x_767_);
lean_dec(v_x_767_);
lean_dec_ref(v_m_766_);
v_r_769_ = lean_box(v_res_768_);
return v_r_769_;
}
}
LEAN_EXPORT uint8_t lp_hoba_Hoba_Machine_WellFormed(lean_object* v_m_770_){
_start:
{
lean_object* v_n_771_; lean_object* v_kind_772_; lean_object* v_deviations_773_; lean_object* v_edges_774_; lean_object* v_rank_775_; uint8_t v___y_777_; lean_object* v___x_781_; uint8_t v___x_782_; 
v_n_771_ = lean_ctor_get(v_m_770_, 0);
v_kind_772_ = lean_ctor_get(v_m_770_, 1);
v_deviations_773_ = lean_ctor_get(v_m_770_, 2);
v_edges_774_ = lean_ctor_get(v_m_770_, 3);
v_rank_775_ = lean_ctor_get(v_m_770_, 4);
v___x_781_ = l_List_lengthTR___redArg(v_kind_772_);
v___x_782_ = lean_nat_dec_eq(v___x_781_, v_n_771_);
lean_dec(v___x_781_);
if (v___x_782_ == 0)
{
v___y_777_ = v___x_782_;
goto v___jp_776_;
}
else
{
lean_object* v___x_783_; uint8_t v___x_784_; 
v___x_783_ = l_List_lengthTR___redArg(v_rank_775_);
v___x_784_ = lean_nat_dec_eq(v___x_783_, v_n_771_);
lean_dec(v___x_783_);
v___y_777_ = v___x_784_;
goto v___jp_776_;
}
v___jp_776_:
{
if (v___y_777_ == 0)
{
return v___y_777_;
}
else
{
lean_object* v___x_778_; uint8_t v___x_779_; 
v___x_778_ = l_List_lengthTR___redArg(v_deviations_773_);
v___x_779_ = lean_nat_dec_eq(v___x_778_, v_n_771_);
lean_dec(v___x_778_);
if (v___x_779_ == 0)
{
return v___x_779_;
}
else
{
uint8_t v___x_780_; 
v___x_780_ = lp_hoba_List_all___at___00Hoba_Machine_WellFormed_spec__0(v_m_770_, v_edges_774_);
return v___x_780_;
}
}
}
}
}
LEAN_EXPORT lean_object* lp_hoba_Hoba_Machine_WellFormed___boxed(lean_object* v_m_785_){
_start:
{
uint8_t v_res_786_; lean_object* v_r_787_; 
v_res_786_ = lp_hoba_Hoba_Machine_WellFormed(v_m_785_);
lean_dec_ref(v_m_785_);
v_r_787_ = lean_box(v_res_786_);
return v_r_787_;
}
}
LEAN_EXPORT uint8_t lp_hoba_List_all___at___00Hoba_Machine_Forward_spec__0(lean_object* v_m_788_, lean_object* v_x_789_){
_start:
{
if (lean_obj_tag(v_x_789_) == 0)
{
uint8_t v___x_790_; 
v___x_790_ = 1;
return v___x_790_;
}
else
{
lean_object* v_head_791_; lean_object* v_tail_792_; lean_object* v_fst_793_; lean_object* v_snd_794_; lean_object* v___x_795_; lean_object* v___x_796_; uint8_t v___x_797_; 
v_head_791_ = lean_ctor_get(v_x_789_, 0);
lean_inc(v_head_791_);
v_tail_792_ = lean_ctor_get(v_x_789_, 1);
lean_inc(v_tail_792_);
lean_dec_ref_known(v_x_789_, 2);
v_fst_793_ = lean_ctor_get(v_head_791_, 0);
lean_inc(v_fst_793_);
v_snd_794_ = lean_ctor_get(v_head_791_, 1);
lean_inc(v_snd_794_);
lean_dec(v_head_791_);
v___x_795_ = lp_hoba_Hoba_Machine_rankOf(v_m_788_, v_fst_793_);
v___x_796_ = lp_hoba_Hoba_Machine_rankOf(v_m_788_, v_snd_794_);
v___x_797_ = lean_nat_dec_lt(v___x_795_, v___x_796_);
lean_dec(v___x_796_);
lean_dec(v___x_795_);
if (v___x_797_ == 0)
{
lean_dec(v_tail_792_);
return v___x_797_;
}
else
{
v_x_789_ = v_tail_792_;
goto _start;
}
}
}
}
LEAN_EXPORT lean_object* lp_hoba_List_all___at___00Hoba_Machine_Forward_spec__0___boxed(lean_object* v_m_799_, lean_object* v_x_800_){
_start:
{
uint8_t v_res_801_; lean_object* v_r_802_; 
v_res_801_ = lp_hoba_List_all___at___00Hoba_Machine_Forward_spec__0(v_m_799_, v_x_800_);
lean_dec_ref(v_m_799_);
v_r_802_ = lean_box(v_res_801_);
return v_r_802_;
}
}
LEAN_EXPORT uint8_t lp_hoba_Hoba_Machine_Forward(lean_object* v_m_803_){
_start:
{
lean_object* v_edges_804_; uint8_t v___x_805_; 
v_edges_804_ = lean_ctor_get(v_m_803_, 3);
lean_inc(v_edges_804_);
v___x_805_ = lp_hoba_List_all___at___00Hoba_Machine_Forward_spec__0(v_m_803_, v_edges_804_);
lean_dec_ref(v_m_803_);
return v___x_805_;
}
}
LEAN_EXPORT lean_object* lp_hoba_Hoba_Machine_Forward___boxed(lean_object* v_m_806_){
_start:
{
uint8_t v_res_807_; lean_object* v_r_808_; 
v_res_807_ = lp_hoba_Hoba_Machine_Forward(v_m_806_);
v_r_808_ = lean_box(v_res_807_);
return v_r_808_;
}
}
LEAN_EXPORT uint8_t lp_hoba_List_any___at___00Hoba_Machine_NoDeadEnds_spec__0(lean_object* v_s_809_, lean_object* v_x_810_){
_start:
{
if (lean_obj_tag(v_x_810_) == 0)
{
uint8_t v___x_811_; 
v___x_811_ = 0;
return v___x_811_;
}
else
{
lean_object* v_head_812_; lean_object* v_tail_813_; lean_object* v_fst_814_; uint8_t v___x_815_; 
v_head_812_ = lean_ctor_get(v_x_810_, 0);
v_tail_813_ = lean_ctor_get(v_x_810_, 1);
v_fst_814_ = lean_ctor_get(v_head_812_, 0);
v___x_815_ = lean_nat_dec_eq(v_fst_814_, v_s_809_);
if (v___x_815_ == 0)
{
v_x_810_ = v_tail_813_;
goto _start;
}
else
{
return v___x_815_;
}
}
}
}
LEAN_EXPORT lean_object* lp_hoba_List_any___at___00Hoba_Machine_NoDeadEnds_spec__0___boxed(lean_object* v_s_817_, lean_object* v_x_818_){
_start:
{
uint8_t v_res_819_; lean_object* v_r_820_; 
v_res_819_ = lp_hoba_List_any___at___00Hoba_Machine_NoDeadEnds_spec__0(v_s_817_, v_x_818_);
lean_dec(v_x_818_);
lean_dec(v_s_817_);
v_r_820_ = lean_box(v_res_819_);
return v_r_820_;
}
}
LEAN_EXPORT uint8_t lp_hoba_List_all___at___00Hoba_Machine_NoDeadEnds_spec__1(lean_object* v_m_821_, lean_object* v_x_822_){
_start:
{
if (lean_obj_tag(v_x_822_) == 0)
{
uint8_t v___x_823_; 
v___x_823_ = 1;
return v___x_823_;
}
else
{
lean_object* v_head_824_; lean_object* v_tail_825_; uint8_t v___y_827_; uint8_t v___x_829_; uint8_t v___x_830_; uint8_t v___x_831_; 
v_head_824_ = lean_ctor_get(v_x_822_, 0);
lean_inc_n(v_head_824_, 2);
v_tail_825_ = lean_ctor_get(v_x_822_, 1);
lean_inc(v_tail_825_);
lean_dec_ref_known(v_x_822_, 2);
v___x_829_ = lp_hoba_Hoba_Machine_kindOf(v_m_821_, v_head_824_);
v___x_830_ = 2;
v___x_831_ = lp_hoba_Hoba_instDecidableEqKind(v___x_829_, v___x_830_);
if (v___x_831_ == 0)
{
lean_object* v_edges_832_; uint8_t v___x_833_; 
v_edges_832_ = lean_ctor_get(v_m_821_, 3);
v___x_833_ = lp_hoba_List_any___at___00Hoba_Machine_NoDeadEnds_spec__0(v_head_824_, v_edges_832_);
lean_dec(v_head_824_);
v___y_827_ = v___x_833_;
goto v___jp_826_;
}
else
{
lean_dec(v_head_824_);
v___y_827_ = v___x_831_;
goto v___jp_826_;
}
v___jp_826_:
{
if (v___y_827_ == 0)
{
lean_dec(v_tail_825_);
return v___y_827_;
}
else
{
v_x_822_ = v_tail_825_;
goto _start;
}
}
}
}
}
LEAN_EXPORT lean_object* lp_hoba_List_all___at___00Hoba_Machine_NoDeadEnds_spec__1___boxed(lean_object* v_m_834_, lean_object* v_x_835_){
_start:
{
uint8_t v_res_836_; lean_object* v_r_837_; 
v_res_836_ = lp_hoba_List_all___at___00Hoba_Machine_NoDeadEnds_spec__1(v_m_834_, v_x_835_);
lean_dec_ref(v_m_834_);
v_r_837_ = lean_box(v_res_836_);
return v_r_837_;
}
}
LEAN_EXPORT uint8_t lp_hoba_Hoba_Machine_NoDeadEnds(lean_object* v_m_838_){
_start:
{
lean_object* v___x_839_; uint8_t v___x_840_; 
lean_inc_ref(v_m_838_);
v___x_839_ = lp_hoba_Hoba_Machine_states(v_m_838_);
v___x_840_ = lp_hoba_List_all___at___00Hoba_Machine_NoDeadEnds_spec__1(v_m_838_, v___x_839_);
lean_dec_ref(v_m_838_);
return v___x_840_;
}
}
LEAN_EXPORT lean_object* lp_hoba_Hoba_Machine_NoDeadEnds___boxed(lean_object* v_m_841_){
_start:
{
uint8_t v_res_842_; lean_object* v_r_843_; 
v_res_842_ = lp_hoba_Hoba_Machine_NoDeadEnds(v_m_841_);
v_r_843_ = lean_box(v_res_842_);
return v_r_843_;
}
}
LEAN_EXPORT lean_object* lp_hoba_List_filterTR_loop___at___00Hoba_Machine_homesFor_spec__0(lean_object* v_b_844_, lean_object* v_a_845_, lean_object* v_a_846_){
_start:
{
if (lean_obj_tag(v_a_845_) == 0)
{
lean_object* v___x_847_; 
v___x_847_ = l_List_reverse___redArg(v_a_846_);
return v___x_847_;
}
else
{
lean_object* v_head_848_; lean_object* v_tail_849_; lean_object* v___x_851_; uint8_t v_isShared_852_; uint8_t v_isSharedCheck_859_; 
v_head_848_ = lean_ctor_get(v_a_845_, 0);
v_tail_849_ = lean_ctor_get(v_a_845_, 1);
v_isSharedCheck_859_ = !lean_is_exclusive(v_a_845_);
if (v_isSharedCheck_859_ == 0)
{
v___x_851_ = v_a_845_;
v_isShared_852_ = v_isSharedCheck_859_;
goto v_resetjp_850_;
}
else
{
lean_inc(v_tail_849_);
lean_inc(v_head_848_);
lean_dec(v_a_845_);
v___x_851_ = lean_box(0);
v_isShared_852_ = v_isSharedCheck_859_;
goto v_resetjp_850_;
}
v_resetjp_850_:
{
uint8_t v___x_853_; 
v___x_853_ = l_List_elem___at___00Lean_Meta_Occurrences_contains_spec__0(v_b_844_, v_head_848_);
if (v___x_853_ == 0)
{
lean_del_object(v___x_851_);
lean_dec(v_head_848_);
v_a_845_ = v_tail_849_;
goto _start;
}
else
{
lean_object* v___x_856_; 
if (v_isShared_852_ == 0)
{
lean_ctor_set(v___x_851_, 1, v_a_846_);
v___x_856_ = v___x_851_;
goto v_reusejp_855_;
}
else
{
lean_object* v_reuseFailAlloc_858_; 
v_reuseFailAlloc_858_ = lean_alloc_ctor(1, 2, 0);
lean_ctor_set(v_reuseFailAlloc_858_, 0, v_head_848_);
lean_ctor_set(v_reuseFailAlloc_858_, 1, v_a_846_);
v___x_856_ = v_reuseFailAlloc_858_;
goto v_reusejp_855_;
}
v_reusejp_855_:
{
v_a_845_ = v_tail_849_;
v_a_846_ = v___x_856_;
goto _start;
}
}
}
}
}
}
LEAN_EXPORT lean_object* lp_hoba_List_filterTR_loop___at___00Hoba_Machine_homesFor_spec__0___boxed(lean_object* v_b_860_, lean_object* v_a_861_, lean_object* v_a_862_){
_start:
{
lean_object* v_res_863_; 
v_res_863_ = lp_hoba_List_filterTR_loop___at___00Hoba_Machine_homesFor_spec__0(v_b_860_, v_a_861_, v_a_862_);
lean_dec(v_b_860_);
return v_res_863_;
}
}
LEAN_EXPORT lean_object* lp_hoba_Hoba_Machine_homesFor(lean_object* v_m_864_, lean_object* v_b_865_){
_start:
{
lean_object* v_deviations_866_; lean_object* v___x_867_; lean_object* v___x_868_; lean_object* v___x_869_; 
v_deviations_866_ = lean_ctor_get(v_m_864_, 2);
lean_inc(v_deviations_866_);
lean_dec_ref(v_m_864_);
v___x_867_ = lean_box(0);
v___x_868_ = lp_hoba_List_filterTR_loop___at___00Hoba_Machine_homesFor_spec__0(v_b_865_, v_deviations_866_, v___x_867_);
v___x_869_ = l_List_lengthTR___redArg(v___x_868_);
lean_dec(v___x_868_);
return v___x_869_;
}
}
LEAN_EXPORT lean_object* lp_hoba_Hoba_Machine_homesFor___boxed(lean_object* v_m_870_, lean_object* v_b_871_){
_start:
{
lean_object* v_res_872_; 
v_res_872_ = lp_hoba_Hoba_Machine_homesFor(v_m_870_, v_b_871_);
lean_dec(v_b_871_);
return v_res_872_;
}
}
LEAN_EXPORT lean_object* lp_hoba___private_Hoba_Machine_0__Hoba_Machine_absorb(lean_object* v_seen_873_, lean_object* v_x_874_){
_start:
{
if (lean_obj_tag(v_x_874_) == 0)
{
return v_seen_873_;
}
else
{
lean_object* v_head_875_; lean_object* v_tail_876_; lean_object* v___x_878_; uint8_t v_isShared_879_; uint8_t v_isSharedCheck_888_; 
v_head_875_ = lean_ctor_get(v_x_874_, 0);
v_tail_876_ = lean_ctor_get(v_x_874_, 1);
v_isSharedCheck_888_ = !lean_is_exclusive(v_x_874_);
if (v_isSharedCheck_888_ == 0)
{
v___x_878_ = v_x_874_;
v_isShared_879_ = v_isSharedCheck_888_;
goto v_resetjp_877_;
}
else
{
lean_inc(v_tail_876_);
lean_inc(v_head_875_);
lean_dec(v_x_874_);
v___x_878_ = lean_box(0);
v_isShared_879_ = v_isSharedCheck_888_;
goto v_resetjp_877_;
}
v_resetjp_877_:
{
uint8_t v___x_880_; 
v___x_880_ = l_List_elem___at___00Lean_Meta_Occurrences_contains_spec__0(v_head_875_, v_seen_873_);
if (v___x_880_ == 0)
{
lean_object* v___x_881_; lean_object* v___x_883_; 
v___x_881_ = lean_box(0);
if (v_isShared_879_ == 0)
{
lean_ctor_set(v___x_878_, 1, v___x_881_);
v___x_883_ = v___x_878_;
goto v_reusejp_882_;
}
else
{
lean_object* v_reuseFailAlloc_886_; 
v_reuseFailAlloc_886_ = lean_alloc_ctor(1, 2, 0);
lean_ctor_set(v_reuseFailAlloc_886_, 0, v_head_875_);
lean_ctor_set(v_reuseFailAlloc_886_, 1, v___x_881_);
v___x_883_ = v_reuseFailAlloc_886_;
goto v_reusejp_882_;
}
v_reusejp_882_:
{
lean_object* v___x_884_; 
v___x_884_ = l_List_appendTR___redArg(v_seen_873_, v___x_883_);
v_seen_873_ = v___x_884_;
v_x_874_ = v_tail_876_;
goto _start;
}
}
else
{
lean_del_object(v___x_878_);
lean_dec(v_head_875_);
v_x_874_ = v_tail_876_;
goto _start;
}
}
}
}
}
LEAN_EXPORT lean_object* lp_hoba___private_Init_Data_List_Impl_0__List_flatMapTR_go___at___00__private_Hoba_Machine_0__Hoba_Machine_grow_spec__0(lean_object* v_m_889_, lean_object* v_a_890_, lean_object* v_a_891_){
_start:
{
if (lean_obj_tag(v_a_890_) == 0)
{
lean_object* v___x_892_; 
lean_dec_ref(v_m_889_);
v___x_892_ = lean_array_to_list(v_a_891_);
return v___x_892_;
}
else
{
lean_object* v_head_893_; lean_object* v_tail_894_; lean_object* v___x_895_; lean_object* v___x_896_; 
v_head_893_ = lean_ctor_get(v_a_890_, 0);
v_tail_894_ = lean_ctor_get(v_a_890_, 1);
lean_inc_ref(v_m_889_);
v___x_895_ = lp_hoba_Hoba_Machine_exits(v_m_889_, v_head_893_);
v___x_896_ = l_List_foldl___at___00Array_appendList_spec__0___redArg(v_a_891_, v___x_895_);
v_a_890_ = v_tail_894_;
v_a_891_ = v___x_896_;
goto _start;
}
}
}
LEAN_EXPORT lean_object* lp_hoba___private_Init_Data_List_Impl_0__List_flatMapTR_go___at___00__private_Hoba_Machine_0__Hoba_Machine_grow_spec__0___boxed(lean_object* v_m_898_, lean_object* v_a_899_, lean_object* v_a_900_){
_start:
{
lean_object* v_res_901_; 
v_res_901_ = lp_hoba___private_Init_Data_List_Impl_0__List_flatMapTR_go___at___00__private_Hoba_Machine_0__Hoba_Machine_grow_spec__0(v_m_898_, v_a_899_, v_a_900_);
lean_dec(v_a_899_);
return v_res_901_;
}
}
LEAN_EXPORT lean_object* lp_hoba___private_Hoba_Machine_0__Hoba_Machine_grow(lean_object* v_m_902_, lean_object* v_x_903_, lean_object* v_x_904_){
_start:
{
lean_object* v_zero_905_; uint8_t v_isZero_906_; 
v_zero_905_ = lean_unsigned_to_nat(0u);
v_isZero_906_ = lean_nat_dec_eq(v_x_903_, v_zero_905_);
if (v_isZero_906_ == 1)
{
lean_dec(v_x_903_);
lean_dec_ref(v_m_902_);
return v_x_904_;
}
else
{
lean_object* v___x_907_; lean_object* v___x_908_; lean_object* v_next_909_; lean_object* v___x_910_; lean_object* v___x_911_; uint8_t v___x_912_; 
v___x_907_ = ((lean_object*)(lp_hoba_Hoba_Machine_exits___closed__0));
lean_inc_ref(v_m_902_);
v___x_908_ = lp_hoba___private_Init_Data_List_Impl_0__List_flatMapTR_go___at___00__private_Hoba_Machine_0__Hoba_Machine_grow_spec__0(v_m_902_, v_x_904_, v___x_907_);
lean_inc(v_x_904_);
v_next_909_ = lp_hoba___private_Hoba_Machine_0__Hoba_Machine_absorb(v_x_904_, v___x_908_);
v___x_910_ = l_List_lengthTR___redArg(v_next_909_);
v___x_911_ = l_List_lengthTR___redArg(v_x_904_);
v___x_912_ = lean_nat_dec_eq(v___x_910_, v___x_911_);
lean_dec(v___x_911_);
lean_dec(v___x_910_);
if (v___x_912_ == 0)
{
lean_object* v_one_913_; lean_object* v_n_914_; 
lean_dec(v_x_904_);
v_one_913_ = lean_unsigned_to_nat(1u);
v_n_914_ = lean_nat_sub(v_x_903_, v_one_913_);
lean_dec(v_x_903_);
v_x_903_ = v_n_914_;
v_x_904_ = v_next_909_;
goto _start;
}
else
{
lean_dec(v_next_909_);
lean_dec(v_x_903_);
lean_dec_ref(v_m_902_);
return v_x_904_;
}
}
}
}
LEAN_EXPORT lean_object* lp_hoba_Hoba_Machine_reachable(lean_object* v_m_916_, lean_object* v_start_917_){
_start:
{
lean_object* v_n_918_; lean_object* v___x_919_; lean_object* v___x_920_; lean_object* v___x_921_; 
v_n_918_ = lean_ctor_get(v_m_916_, 0);
lean_inc(v_n_918_);
v___x_919_ = lean_box(0);
v___x_920_ = lean_alloc_ctor(1, 2, 0);
lean_ctor_set(v___x_920_, 0, v_start_917_);
lean_ctor_set(v___x_920_, 1, v___x_919_);
v___x_921_ = lp_hoba___private_Hoba_Machine_0__Hoba_Machine_grow(v_m_916_, v_n_918_, v___x_920_);
return v___x_921_;
}
}
LEAN_EXPORT uint8_t lp_hoba_List_all___at___00Hoba_Machine_AllReachable_spec__0(lean_object* v_m_922_, lean_object* v_start_923_, lean_object* v_x_924_){
_start:
{
if (lean_obj_tag(v_x_924_) == 0)
{
uint8_t v___x_925_; 
lean_dec(v_start_923_);
lean_dec_ref(v_m_922_);
v___x_925_ = 1;
return v___x_925_;
}
else
{
lean_object* v_head_926_; lean_object* v_tail_927_; lean_object* v___x_928_; uint8_t v___x_929_; 
v_head_926_ = lean_ctor_get(v_x_924_, 0);
v_tail_927_ = lean_ctor_get(v_x_924_, 1);
lean_inc(v_start_923_);
lean_inc_ref(v_m_922_);
v___x_928_ = lp_hoba_Hoba_Machine_reachable(v_m_922_, v_start_923_);
v___x_929_ = l_List_elem___at___00Lean_Meta_Occurrences_contains_spec__0(v_head_926_, v___x_928_);
lean_dec(v___x_928_);
if (v___x_929_ == 0)
{
lean_dec(v_start_923_);
lean_dec_ref(v_m_922_);
return v___x_929_;
}
else
{
v_x_924_ = v_tail_927_;
goto _start;
}
}
}
}
LEAN_EXPORT lean_object* lp_hoba_List_all___at___00Hoba_Machine_AllReachable_spec__0___boxed(lean_object* v_m_931_, lean_object* v_start_932_, lean_object* v_x_933_){
_start:
{
uint8_t v_res_934_; lean_object* v_r_935_; 
v_res_934_ = lp_hoba_List_all___at___00Hoba_Machine_AllReachable_spec__0(v_m_931_, v_start_932_, v_x_933_);
lean_dec(v_x_933_);
v_r_935_ = lean_box(v_res_934_);
return v_r_935_;
}
}
LEAN_EXPORT uint8_t lp_hoba_Hoba_Machine_AllReachable(lean_object* v_m_936_, lean_object* v_start_937_){
_start:
{
lean_object* v___x_938_; uint8_t v___x_939_; 
lean_inc_ref(v_m_936_);
v___x_938_ = lp_hoba_Hoba_Machine_states(v_m_936_);
v___x_939_ = lp_hoba_List_all___at___00Hoba_Machine_AllReachable_spec__0(v_m_936_, v_start_937_, v___x_938_);
lean_dec(v___x_938_);
return v___x_939_;
}
}
LEAN_EXPORT lean_object* lp_hoba_Hoba_Machine_AllReachable___boxed(lean_object* v_m_940_, lean_object* v_start_941_){
_start:
{
uint8_t v_res_942_; lean_object* v_r_943_; 
v_res_942_ = lp_hoba_Hoba_Machine_AllReachable(v_m_940_, v_start_941_);
v_r_943_ = lean_box(v_res_942_);
return v_r_943_;
}
}
LEAN_EXPORT uint8_t lp_hoba_List_elem___at___00Hoba_Machine_Chain_spec__0(lean_object* v_a_944_, lean_object* v_x_945_){
_start:
{
if (lean_obj_tag(v_x_945_) == 0)
{
uint8_t v___x_946_; 
v___x_946_ = 0;
return v___x_946_;
}
else
{
lean_object* v_head_947_; lean_object* v_tail_948_; uint8_t v___y_950_; lean_object* v_fst_952_; lean_object* v_snd_953_; lean_object* v_fst_954_; lean_object* v_snd_955_; uint8_t v___x_956_; 
v_head_947_ = lean_ctor_get(v_x_945_, 0);
v_tail_948_ = lean_ctor_get(v_x_945_, 1);
v_fst_952_ = lean_ctor_get(v_a_944_, 0);
v_snd_953_ = lean_ctor_get(v_a_944_, 1);
v_fst_954_ = lean_ctor_get(v_head_947_, 0);
v_snd_955_ = lean_ctor_get(v_head_947_, 1);
v___x_956_ = lean_nat_dec_eq(v_fst_952_, v_fst_954_);
if (v___x_956_ == 0)
{
v___y_950_ = v___x_956_;
goto v___jp_949_;
}
else
{
uint8_t v___x_957_; 
v___x_957_ = lean_nat_dec_eq(v_snd_953_, v_snd_955_);
v___y_950_ = v___x_957_;
goto v___jp_949_;
}
v___jp_949_:
{
if (v___y_950_ == 0)
{
v_x_945_ = v_tail_948_;
goto _start;
}
else
{
return v___y_950_;
}
}
}
}
}
LEAN_EXPORT lean_object* lp_hoba_List_elem___at___00Hoba_Machine_Chain_spec__0___boxed(lean_object* v_a_958_, lean_object* v_x_959_){
_start:
{
uint8_t v_res_960_; lean_object* v_r_961_; 
v_res_960_ = lp_hoba_List_elem___at___00Hoba_Machine_Chain_spec__0(v_a_958_, v_x_959_);
lean_dec(v_x_959_);
lean_dec_ref(v_a_958_);
v_r_961_ = lean_box(v_res_960_);
return v_r_961_;
}
}
LEAN_EXPORT uint8_t lp_hoba_Hoba_Machine_Chain(lean_object* v_m_962_, lean_object* v_x_963_){
_start:
{
if (lean_obj_tag(v_x_963_) == 0)
{
uint8_t v___x_964_; 
v___x_964_ = 1;
return v___x_964_;
}
else
{
lean_object* v_tail_965_; 
v_tail_965_ = lean_ctor_get(v_x_963_, 1);
lean_inc(v_tail_965_);
if (lean_obj_tag(v_tail_965_) == 0)
{
uint8_t v___x_966_; 
lean_dec_ref_known(v_x_963_, 2);
v___x_966_ = 1;
return v___x_966_;
}
else
{
lean_object* v_head_967_; lean_object* v___x_969_; uint8_t v_isShared_970_; uint8_t v_isSharedCheck_978_; 
v_head_967_ = lean_ctor_get(v_x_963_, 0);
v_isSharedCheck_978_ = !lean_is_exclusive(v_x_963_);
if (v_isSharedCheck_978_ == 0)
{
lean_object* v_unused_979_; 
v_unused_979_ = lean_ctor_get(v_x_963_, 1);
lean_dec(v_unused_979_);
v___x_969_ = v_x_963_;
v_isShared_970_ = v_isSharedCheck_978_;
goto v_resetjp_968_;
}
else
{
lean_inc(v_head_967_);
lean_dec(v_x_963_);
v___x_969_ = lean_box(0);
v_isShared_970_ = v_isSharedCheck_978_;
goto v_resetjp_968_;
}
v_resetjp_968_:
{
lean_object* v_head_971_; lean_object* v_edges_972_; lean_object* v___x_974_; 
v_head_971_ = lean_ctor_get(v_tail_965_, 0);
v_edges_972_ = lean_ctor_get(v_m_962_, 3);
lean_inc(v_head_971_);
if (v_isShared_970_ == 0)
{
lean_ctor_set_tag(v___x_969_, 0);
lean_ctor_set(v___x_969_, 1, v_head_971_);
v___x_974_ = v___x_969_;
goto v_reusejp_973_;
}
else
{
lean_object* v_reuseFailAlloc_977_; 
v_reuseFailAlloc_977_ = lean_alloc_ctor(0, 2, 0);
lean_ctor_set(v_reuseFailAlloc_977_, 0, v_head_967_);
lean_ctor_set(v_reuseFailAlloc_977_, 1, v_head_971_);
v___x_974_ = v_reuseFailAlloc_977_;
goto v_reusejp_973_;
}
v_reusejp_973_:
{
uint8_t v___x_975_; 
v___x_975_ = lp_hoba_List_elem___at___00Hoba_Machine_Chain_spec__0(v___x_974_, v_edges_972_);
lean_dec_ref(v___x_974_);
if (v___x_975_ == 0)
{
lean_dec_ref_known(v_tail_965_, 2);
return v___x_975_;
}
else
{
v_x_963_ = v_tail_965_;
goto _start;
}
}
}
}
}
}
}
LEAN_EXPORT lean_object* lp_hoba_Hoba_Machine_Chain___boxed(lean_object* v_m_980_, lean_object* v_x_981_){
_start:
{
uint8_t v_res_982_; lean_object* v_r_983_; 
v_res_982_ = lp_hoba_Hoba_Machine_Chain(v_m_980_, v_x_981_);
lean_dec_ref(v_m_980_);
v_r_983_ = lean_box(v_res_982_);
return v_r_983_;
}
}
LEAN_EXPORT uint8_t lp_hoba_Hoba_Machine_IsCycle(lean_object* v_m_984_, lean_object* v_a_985_, lean_object* v_l_986_){
_start:
{
lean_object* v___x_987_; lean_object* v___x_988_; lean_object* v___x_989_; lean_object* v___x_990_; uint8_t v___x_991_; 
v___x_987_ = lean_box(0);
lean_inc(v_a_985_);
v___x_988_ = lean_alloc_ctor(1, 2, 0);
lean_ctor_set(v___x_988_, 0, v_a_985_);
lean_ctor_set(v___x_988_, 1, v___x_987_);
v___x_989_ = l_List_appendTR___redArg(v_l_986_, v___x_988_);
v___x_990_ = lean_alloc_ctor(1, 2, 0);
lean_ctor_set(v___x_990_, 0, v_a_985_);
lean_ctor_set(v___x_990_, 1, v___x_989_);
v___x_991_ = lp_hoba_Hoba_Machine_Chain(v_m_984_, v___x_990_);
return v___x_991_;
}
}
LEAN_EXPORT lean_object* lp_hoba_Hoba_Machine_IsCycle___boxed(lean_object* v_m_992_, lean_object* v_a_993_, lean_object* v_l_994_){
_start:
{
uint8_t v_res_995_; lean_object* v_r_996_; 
v_res_995_ = lp_hoba_Hoba_Machine_IsCycle(v_m_992_, v_a_993_, v_l_994_);
lean_dec_ref(v_m_992_);
v_r_996_ = lean_box(v_res_995_);
return v_r_996_;
}
}
LEAN_EXPORT uint8_t lp_hoba_Hoba_Machine_Climbs(lean_object* v_m_997_, lean_object* v_x_998_){
_start:
{
if (lean_obj_tag(v_x_998_) == 1)
{
lean_object* v_tail_999_; 
v_tail_999_ = lean_ctor_get(v_x_998_, 1);
lean_inc(v_tail_999_);
if (lean_obj_tag(v_tail_999_) == 1)
{
lean_object* v_head_1000_; lean_object* v_head_1001_; lean_object* v___x_1002_; lean_object* v___x_1003_; uint8_t v___x_1004_; 
v_head_1000_ = lean_ctor_get(v_x_998_, 0);
lean_inc(v_head_1000_);
lean_dec_ref_known(v_x_998_, 2);
v_head_1001_ = lean_ctor_get(v_tail_999_, 0);
v___x_1002_ = lp_hoba_Hoba_Machine_rankOf(v_m_997_, v_head_1000_);
lean_inc(v_head_1001_);
v___x_1003_ = lp_hoba_Hoba_Machine_rankOf(v_m_997_, v_head_1001_);
v___x_1004_ = lean_nat_dec_lt(v___x_1002_, v___x_1003_);
lean_dec(v___x_1003_);
lean_dec(v___x_1002_);
if (v___x_1004_ == 0)
{
lean_dec_ref_known(v_tail_999_, 2);
return v___x_1004_;
}
else
{
v_x_998_ = v_tail_999_;
goto _start;
}
}
else
{
uint8_t v___x_1006_; 
lean_dec(v_tail_999_);
lean_dec_ref_known(v_x_998_, 2);
v___x_1006_ = 1;
return v___x_1006_;
}
}
else
{
uint8_t v___x_1007_; 
lean_dec(v_x_998_);
v___x_1007_ = 1;
return v___x_1007_;
}
}
}
LEAN_EXPORT lean_object* lp_hoba_Hoba_Machine_Climbs___boxed(lean_object* v_m_1008_, lean_object* v_x_1009_){
_start:
{
uint8_t v_res_1010_; lean_object* v_r_1011_; 
v_res_1010_ = lp_hoba_Hoba_Machine_Climbs(v_m_1008_, v_x_1009_);
lean_dec_ref(v_m_1008_);
v_r_1011_ = lean_box(v_res_1010_);
return v_r_1011_;
}
}
LEAN_EXPORT lean_object* lp_hoba___private_Hoba_Machine_0__Hoba_Machine_Chain_match__1_splitter___redArg(lean_object* v_x_1012_, lean_object* v_h__1_1013_, lean_object* v_h__2_1014_, lean_object* v_h__3_1015_){
_start:
{
if (lean_obj_tag(v_x_1012_) == 0)
{
lean_object* v___x_1016_; lean_object* v___x_1017_; 
lean_dec(v_h__3_1015_);
lean_dec(v_h__2_1014_);
v___x_1016_ = lean_box(0);
v___x_1017_ = lean_apply_1(v_h__1_1013_, v___x_1016_);
return v___x_1017_;
}
else
{
lean_object* v_tail_1018_; 
lean_dec(v_h__1_1013_);
v_tail_1018_ = lean_ctor_get(v_x_1012_, 1);
if (lean_obj_tag(v_tail_1018_) == 0)
{
lean_object* v_head_1019_; lean_object* v___x_1020_; 
lean_dec(v_h__3_1015_);
v_head_1019_ = lean_ctor_get(v_x_1012_, 0);
lean_inc(v_head_1019_);
lean_dec_ref_known(v_x_1012_, 2);
v___x_1020_ = lean_apply_1(v_h__2_1014_, v_head_1019_);
return v___x_1020_;
}
else
{
lean_object* v_head_1021_; lean_object* v_head_1022_; lean_object* v_tail_1023_; lean_object* v___x_1024_; 
lean_inc_ref(v_tail_1018_);
lean_dec(v_h__2_1014_);
v_head_1021_ = lean_ctor_get(v_x_1012_, 0);
lean_inc(v_head_1021_);
lean_dec_ref_known(v_x_1012_, 2);
v_head_1022_ = lean_ctor_get(v_tail_1018_, 0);
lean_inc(v_head_1022_);
v_tail_1023_ = lean_ctor_get(v_tail_1018_, 1);
lean_inc(v_tail_1023_);
lean_dec_ref_known(v_tail_1018_, 2);
v___x_1024_ = lean_apply_3(v_h__3_1015_, v_head_1021_, v_head_1022_, v_tail_1023_);
return v___x_1024_;
}
}
}
}
LEAN_EXPORT lean_object* lp_hoba___private_Hoba_Machine_0__Hoba_Machine_Chain_match__1_splitter(lean_object* v_motive_1025_, lean_object* v_x_1026_, lean_object* v_h__1_1027_, lean_object* v_h__2_1028_, lean_object* v_h__3_1029_){
_start:
{
if (lean_obj_tag(v_x_1026_) == 0)
{
lean_object* v___x_1030_; lean_object* v___x_1031_; 
lean_dec(v_h__3_1029_);
lean_dec(v_h__2_1028_);
v___x_1030_ = lean_box(0);
v___x_1031_ = lean_apply_1(v_h__1_1027_, v___x_1030_);
return v___x_1031_;
}
else
{
lean_object* v_tail_1032_; 
lean_dec(v_h__1_1027_);
v_tail_1032_ = lean_ctor_get(v_x_1026_, 1);
if (lean_obj_tag(v_tail_1032_) == 0)
{
lean_object* v_head_1033_; lean_object* v___x_1034_; 
lean_dec(v_h__3_1029_);
v_head_1033_ = lean_ctor_get(v_x_1026_, 0);
lean_inc(v_head_1033_);
lean_dec_ref_known(v_x_1026_, 2);
v___x_1034_ = lean_apply_1(v_h__2_1028_, v_head_1033_);
return v___x_1034_;
}
else
{
lean_object* v_head_1035_; lean_object* v_head_1036_; lean_object* v_tail_1037_; lean_object* v___x_1038_; 
lean_inc_ref(v_tail_1032_);
lean_dec(v_h__2_1028_);
v_head_1035_ = lean_ctor_get(v_x_1026_, 0);
lean_inc(v_head_1035_);
lean_dec_ref_known(v_x_1026_, 2);
v_head_1036_ = lean_ctor_get(v_tail_1032_, 0);
lean_inc(v_head_1036_);
v_tail_1037_ = lean_ctor_get(v_tail_1032_, 1);
lean_inc(v_tail_1037_);
lean_dec_ref_known(v_tail_1032_, 2);
v___x_1038_ = lean_apply_3(v_h__3_1029_, v_head_1035_, v_head_1036_, v_tail_1037_);
return v___x_1038_;
}
}
}
}
LEAN_EXPORT lean_object* lp_hoba___private_Hoba_Machine_0__Hoba_Machine_Climbs_match__1_splitter___redArg(lean_object* v_x_1039_, lean_object* v_h__1_1040_, lean_object* v_h__2_1041_){
_start:
{
if (lean_obj_tag(v_x_1039_) == 1)
{
lean_object* v_tail_1042_; 
v_tail_1042_ = lean_ctor_get(v_x_1039_, 1);
if (lean_obj_tag(v_tail_1042_) == 1)
{
lean_object* v_head_1043_; lean_object* v_head_1044_; lean_object* v_tail_1045_; lean_object* v___x_1046_; 
lean_inc_ref(v_tail_1042_);
lean_dec(v_h__2_1041_);
v_head_1043_ = lean_ctor_get(v_x_1039_, 0);
lean_inc(v_head_1043_);
lean_dec_ref_known(v_x_1039_, 2);
v_head_1044_ = lean_ctor_get(v_tail_1042_, 0);
lean_inc(v_head_1044_);
v_tail_1045_ = lean_ctor_get(v_tail_1042_, 1);
lean_inc(v_tail_1045_);
lean_dec_ref_known(v_tail_1042_, 2);
v___x_1046_ = lean_apply_3(v_h__1_1040_, v_head_1043_, v_head_1044_, v_tail_1045_);
return v___x_1046_;
}
else
{
lean_object* v___x_1047_; 
lean_dec(v_h__1_1040_);
v___x_1047_ = lean_apply_2(v_h__2_1041_, v_x_1039_, lean_box(0));
return v___x_1047_;
}
}
else
{
lean_object* v___x_1048_; 
lean_dec(v_h__1_1040_);
v___x_1048_ = lean_apply_2(v_h__2_1041_, v_x_1039_, lean_box(0));
return v___x_1048_;
}
}
}
LEAN_EXPORT lean_object* lp_hoba___private_Hoba_Machine_0__Hoba_Machine_Climbs_match__1_splitter(lean_object* v_motive_1049_, lean_object* v_x_1050_, lean_object* v_h__1_1051_, lean_object* v_h__2_1052_){
_start:
{
if (lean_obj_tag(v_x_1050_) == 1)
{
lean_object* v_tail_1053_; 
v_tail_1053_ = lean_ctor_get(v_x_1050_, 1);
if (lean_obj_tag(v_tail_1053_) == 1)
{
lean_object* v_head_1054_; lean_object* v_head_1055_; lean_object* v_tail_1056_; lean_object* v___x_1057_; 
lean_inc_ref(v_tail_1053_);
lean_dec(v_h__2_1052_);
v_head_1054_ = lean_ctor_get(v_x_1050_, 0);
lean_inc(v_head_1054_);
lean_dec_ref_known(v_x_1050_, 2);
v_head_1055_ = lean_ctor_get(v_tail_1053_, 0);
lean_inc(v_head_1055_);
v_tail_1056_ = lean_ctor_get(v_tail_1053_, 1);
lean_inc(v_tail_1056_);
lean_dec_ref_known(v_tail_1053_, 2);
v___x_1057_ = lean_apply_3(v_h__1_1051_, v_head_1054_, v_head_1055_, v_tail_1056_);
return v___x_1057_;
}
else
{
lean_object* v___x_1058_; 
lean_dec(v_h__1_1051_);
v___x_1058_ = lean_apply_2(v_h__2_1052_, v_x_1050_, lean_box(0));
return v___x_1058_;
}
}
else
{
lean_object* v___x_1059_; 
lean_dec(v_h__1_1051_);
v___x_1059_ = lean_apply_2(v_h__2_1052_, v_x_1050_, lean_box(0));
return v___x_1059_;
}
}
}
lean_object* initialize_Init(uint8_t builtin);
lean_object* initialize_Init(uint8_t builtin);
static bool _G_initialized = false;
LEAN_EXPORT lean_object* initialize_hoba_Hoba_Machine(uint8_t builtin) {
lean_object * res;
if (_G_initialized) return lean_io_result_mk_ok(lean_box(0));
_G_initialized = true;
res = initialize_Init(builtin);
if (lean_io_result_is_error(res)) return res;
lean_dec_ref(res);
res = initialize_Init(builtin);
if (lean_io_result_is_error(res)) return res;
lean_dec_ref(res);
lp_hoba_Hoba_instInhabitedKind_default = _init_lp_hoba_Hoba_instInhabitedKind_default();
lp_hoba_Hoba_instInhabitedKind = _init_lp_hoba_Hoba_instInhabitedKind();
return lean_io_result_mk_ok(lean_box(0));
}
#ifdef __cplusplus
}
#endif
