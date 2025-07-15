import {d as e, u as a, o as l, s, i, a as o, b as n, c as t, w as u, r as d, e as r, f as m, g as c, _ as v, h as p, j as f, k as g, l as x, m as b, n as h, p as _, I as y, q as w, t as C, v as E, x as k, y as V, z, A as S, B as D, C as T, D as U, E as $, F as j, G as M, H as P} from "./index-DJbHPZ62.js";
const R = {
    class: "flex flex-col gap-1.5"
}
  , A = {
    class: "flex items-center gap-4"
}
  , F = {
    class: "w-full relative"
}
  , I = {
    class: "flex flex-col gap-1.5"
}
  , B = {
    class: "flex items-center gap-4"
}
  , G = {
    class: "w-full relative"
}
  , W = {
    class: "flex flex-col gap-1.5"
}
  , q = {
    class: "flex items-center gap-4"
}
  , H = {
    class: "w-full relative"
}
  , N = {
    class: "flex flex-col gap-1.5"
}
  , O = {
    class: "flex items-center gap-4"
}
  , Z = {
    class: "w-full relative"
}
  , J = "Campo obrigatório"
  , K = e({
    __name: "PersonalInfo",
    setup(e) {
        const P = a()
          , K = l({
            username: s().min(3, J).max(80, "Máximo 80 caracteres").regex(/^[a-zA-Z0-9_-]+$/, "Apenas letras, números, _ e -"),
            phone: s().min(1, J).refine(n, {
                message: "Telefone inválido"
            }),
            document: s().min(1, J).refine(e => i(e) || o(e), {
                message: "Documento inválido"
            }),
            email: s().min(1, J).email("Email inválido").max(100, "Máximo 100 caracteres")
        })
          , {resetForm: L, isSubmitting: Q, errors: X, defineField: Y, handleSubmit: ee, submitCount: ae, values: le} = t({
            validationSchema: j(K),
            initialValues: {
                username: "",
                phone: "",
                document: "",
                email: ""
            }
        });
        u( () => P.user, e => {
            e && L({
                values: {
                    username: e.username,
                    phone: e.phone,
                    document: e.document || "",
                    email: e.email
                }
            })
        }
        , {
            immediate: !0
        });
        const [se,ie] = Y("username")
          , [oe,ne] = Y("phone")
          , [te,ue] = Y("document")
          , [de,re] = Y("email")
          , me = d({
            email: !1,
            username: !1,
            phone: !1,
            document: !1
        })
          , ce = async e => {
            var a, l, s, i, o, n, t;
            try {
                const l = {
                    [e]: "document" === e ? D(le[e]) : "phone" === e ? (null == (a = le[e]) ? void 0 : a.replace("-", "")) ?? "" : le[e]
                };
                await T.patch("/user", l),
                U.success(`${e} atualizado com sucesso`),
                me.value[e] = !1
            } catch (u) {
                let e = "Não foi possível salvar o campo.";
                if (u instanceof $) {
                    e = (null == (o = null == (i = Object.values(null == (s = null == (l = u.response) ? void 0 : l.data) ? void 0 : s.errors)) ? void 0 : i[0]) ? void 0 : o[0]) ?? (null == (t = null == (n = u.response) ? void 0 : n.data) ? void 0 : t.message) ?? e,
                    window.scrollTo({
                        top: 0,
                        behavior: "smooth"
                    })
                }
                U.error(e)
            }
        }
        ;
        function ve(e) {
            const a = String(e).replace("-", "");
            oe.value = a
        }
        return (e, a) => {
            const l = f
              , s = x
              , i = w
              , o = V
              , n = v
              , t = S("mask");
            return M(),
            r("div", null, [a[11] || (a[11] = m("h1", {
                class: "font-semibold mb-3"
            }, "Informações Pessoais", -1)), c(n, {
                class: "px-5.5"
            }, {
                default: p( () => [m("div", R, [c(l, {
                    for: "email"
                }, {
                    default: p( () => a[7] || (a[7] = [g("Email")])),
                    _: 1,
                    __: [7]
                }), m("div", A, [m("div", F, [c(s, b({
                    id: "email",
                    type: "email",
                    modelValue: h(de),
                    "onUpdate:modelValue": a[0] || (a[0] = e => _(de) ? de.value = e : null)
                }, h(re), {
                    disabled: !me.value.email,
                    "aria-invalid": h(X).email && h(ae) > 0,
                    class: "pl-9"
                }), null, 16, ["modelValue", "disabled", "aria-invalid"]), c(h(y).Mail, {
                    class: "size-4 opacity-35 absolute left-3 top-1/2 -translate-y-1/2"
                })]), c(i, {
                    disabled: h(Q),
                    onClick: a[1] || (a[1] = e => me.value.email ? ce("email") : me.value.email = !0)
                }, {
                    default: p( () => [(M(),
                    C(E(me.value.email ? h(y).Check : h(y).Edit))), g(" " + k(me.value.email ? "Salvar" : "Editar"), 1)]),
                    _: 1
                }, 8, ["disabled"])]), c(o, {
                    message: h(X).email
                }, null, 8, ["message"])]), m("div", I, [c(l, {
                    for: "username"
                }, {
                    default: p( () => a[8] || (a[8] = [g("Username")])),
                    _: 1,
                    __: [8]
                }), m("div", B, [m("div", G, [c(s, b({
                    id: "username",
                    modelValue: h(se),
                    "onUpdate:modelValue": a[2] || (a[2] = e => _(se) ? se.value = e : null)
                }, h(ie), {
                    disabled: !me.value.username,
                    "aria-invalid": h(X).username && h(ae) > 0,
                    class: "pl-9"
                }), null, 16, ["modelValue", "disabled", "aria-invalid"]), c(h(y).Person, {
                    class: "size-4 opacity-35 absolute left-3 top-1/2 -translate-y-1/2"
                })]), c(i, {
                    disabled: h(Q),
                    onClick: a[3] || (a[3] = e => me.value.username ? ce("username") : me.value.username = !0)
                }, {
                    default: p( () => [(M(),
                    C(E(me.value.username ? h(y).Check : h(y).Edit))), g(" " + k(me.value.username ? "Salvar" : "Editar"), 1)]),
                    _: 1
                }, 8, ["disabled"])]), c(o, {
                    message: h(X).username
                }, null, 8, ["message"])]), m("div", W, [c(l, {
                    for: "username"
                }, {
                    default: p( () => a[9] || (a[9] = [g("Telefone")])),
                    _: 1,
                    __: [9]
                }), m("div", q, [m("div", H, [z(c(s, b({
                    id: "phone",
                    type: "tel",
                    "model-value": h(oe),
                    "onUpdate:modelValue": ve
                }, h(ne), {
                    placeholder: "(00) 0000-0000",
                    inputmode: "tel",
                    "aria-invalid": h(X).phone && h(ae) > 0,
                    disabled: !me.value.phone,
                    class: "pl-9"
                }), null, 16, ["model-value", "aria-invalid", "disabled"]), [[t, ["(##) ####-####", "(##) #####-####"]]]), c(h(y).Person, {
                    class: "size-4 opacity-35 absolute left-3 top-1/2 -translate-y-1/2"
                })]), c(i, {
                    disabled: h(Q),
                    onClick: a[4] || (a[4] = e => me.value.phone ? ce("phone") : me.value.phone = !0)
                }, {
                    default: p( () => [(M(),
                    C(E(me.value.phone ? h(y).Check : h(y).Edit))), g(" " + k(me.value.phone ? "Salvar" : "Editar"), 1)]),
                    _: 1
                }, 8, ["disabled"])]), c(o, {
                    message: h(X).username
                }, null, 8, ["message"])]), m("div", N, [c(l, {
                    for: "document"
                }, {
                    default: p( () => a[10] || (a[10] = [g("Documento")])),
                    _: 1,
                    __: [10]
                }), m("div", O, [m("div", Z, [z(c(s, b({
                    id: "document",
                    modelValue: h(te),
                    "onUpdate:modelValue": a[5] || (a[5] = e => _(te) ? te.value = e : null)
                }, h(ue), {
                    class: "pl-9",
                    placeholder: "000.000.000-00",
                    inputmode: "numeric",
                    disabled: !me.value.document,
                    "aria-invalid": h(X).document && h(ae) > 0
                }), null, 16, ["modelValue", "disabled", "aria-invalid"]), [[t, 11 === h(D)(h(te)).length ? "###.###.###-##" : "##.###.###/####-##"]]), c(h(y).Document, {
                    class: "size-4 opacity-35 absolute left-3 top-1/2 -translate-y-1/2"
                })]), c(i, {
                    disabled: h(Q),
                    onClick: a[6] || (a[6] = e => me.value.document ? ce("document") : me.value.document = !0)
                }, {
                    default: p( () => [(M(),
                    C(E(me.value.document ? h(y).Check : h(y).Edit))), g(" " + k(me.value.document ? "Salvar" : "Editar"), 1)]),
                    _: 1
                }, 8, ["disabled"])]), c(o, {
                    message: h(X).document
                }, null, 8, ["message"])])]),
                _: 1
            })])
        }
    }
})
  , L = {
    class: "flex flex-col gap-1"
}
  , Q = {
    class: "text-sm text-muted-foreground"
}
  , X = {
    class: "flex items-center gap-2"
}
  , Y = {
    class: "text-2xl font-semibold text-emerald-400"
}
  , ee = {
    class: "text-2xl font-semibold"
}
  , ae = {
    class: "p-2 bg-muted-foreground/10 rounded-lg group-hover:bg-muted-foreground/20 transition-colors"
}
  , le = e({
    __name: "Widget",
    props: {
        title: {},
        prefix: {},
        value: {},
        icon: {}
    },
    setup(e) {
        const a = e;
        return (e, l) => {
            const s = v;
            return M(),
            C(s, {
                class: "px-5 py-4.5 justify-between flex flex-row items-center gap-3 group select-none"
            }, {
                default: p( () => [m("div", L, [m("span", Q, k(a.title), 1), m("div", X, [m("span", Y, k(a.prefix), 1), m("span", ee, k(a.value), 1)])]), m("div", ae, [(M(),
                C(E(a.icon), {
                    class: "size-8 p-0.5 select-none text-primary"
                }))])]),
                _: 1
            })
        }
    }
})
  , se = {
    class: "flex flex-col gap-4"
}
  , ie = {
    class: ""
}
  , oe = {
    class: "grid sm:grid-cols-3 gap-3.5"
}
  , ne = e({
    __name: "Me",
    setup(e) {
        const l = a();
        return (e, a) => {
            var s, i, o, n;
            const t = le
              , u = K;
            return M(),
            r("section", se, [m("div", ie, [a[0] || (a[0] = m("h1", {
                class: "font-semibold mb-3"
            }, "Estatísticas", -1)), m("div", oe, [c(t, {
                title: "Total Depositado",
                prefix: "R$",
                value: h(P)((null == (i = null == (s = h(l).user) ? void 0 : s.stat) ? void 0 : i.deposit_sum) ?? 0),
                icon: h(y).Deposit
            }, null, 8, ["value", "icon"]), c(t, {
                title: "Total Retirado",
                prefix: "R$",
                value: h(P)((null == (n = null == (o = h(l).user) ? void 0 : o.stat) ? void 0 : n.withdraw_sum) ?? 0),
                icon: h(y).Withdraw
            }, null, 8, ["value", "icon"]), c(t, {
                title: "Ganho em Cashback",
                prefix: "R$",
                value: h(P)(0),
                icon: h(y).CashBag
            }, null, 8, ["value", "icon"])])]), c(u)])
        }
    }
});
export {ne as default};
