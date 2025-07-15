import {d as s, e as a, f as e, g as t, h as l, J as u, _ as n, K as _, n as o, I as d, L as i, k as f, M as r, N as c, x as m, G as p} from "./index-DJbHPZ62.js";
import {_ as v, a as x, b as y, c as g, d as h, e as b, f as w, g as j} from "./PopoverItem.vue_vue_type_script_setup_true_lang-6D509ooZ.js";
const k = {
    class: ""
}
  , A = {
    class: "flex items-center justify-between mb-3"
}
  , I = s({
    __name: "GameHistory",
    setup(s) {
        const I = [];
        return (s, M) => {
            const z = _
              , D = v
              , G = i
              , H = u
              , J = y
              , S = b
              , C = h
              , E = g
              , K = j
              , L = w
              , N = x
              , P = n;
            return p(),
            a("div", k, [e("div", A, [M[1] || (M[1] = e("h1", {
                class: "font-semibold"
            }, "Histórico de Jogos", -1)), t(H, null, {
                default: l( () => [t(z, null, {
                    default: l( () => [t(o(d).ThreeDotsVertical, {
                        class: "size-6.5 p-1 cursor-pointer transition-transform active:scale-90"
                    })]),
                    _: 1
                }), t(G, {
                    class: "p-2 w-[240px] space-y-2",
                    align: "end",
                    "side-offset": 12
                }, {
                    default: l( () => [t(D, {
                        onClick: () => {}
                    }, {
                        default: l( () => [t(o(d).Download, {
                            class: "size-[1.2em]"
                        }), M[0] || (M[0] = f(" Exportar resultados "))]),
                        _: 1,
                        __: [0]
                    })]),
                    _: 1
                })]),
                _: 1
            })]), t(P, {
                class: "px-5.5"
            }, {
                default: l( () => [t(N, null, {
                    default: l( () => [t(J, null, {
                        default: l( () => M[2] || (M[2] = [f("A list of your recent invoices.")])),
                        _: 1,
                        __: [2]
                    }), t(E, null, {
                        default: l( () => [t(C, null, {
                            default: l( () => [t(S, {
                                class: "w-[100px]"
                            }, {
                                default: l( () => M[3] || (M[3] = [f(" Invoice ")])),
                                _: 1,
                                __: [3]
                            }), t(S, null, {
                                default: l( () => M[4] || (M[4] = [f("Status")])),
                                _: 1,
                                __: [4]
                            }), t(S, null, {
                                default: l( () => M[5] || (M[5] = [f("Method")])),
                                _: 1,
                                __: [5]
                            }), t(S, {
                                class: "text-right"
                            }, {
                                default: l( () => M[6] || (M[6] = [f(" Amount ")])),
                                _: 1,
                                __: [6]
                            })]),
                            _: 1
                        })]),
                        _: 1
                    }), t(L, null, {
                        default: l( () => [(p(),
                        a(r, null, c(I, s => t(C, {
                            key: s.invoice
                        }, {
                            default: l( () => [t(K, {
                                class: "font-medium"
                            }, {
                                default: l( () => [f(m(s.invoice), 1)]),
                                _: 2
                            }, 1024), t(K, null, {
                                default: l( () => [f(m(s.paymentStatus), 1)]),
                                _: 2
                            }, 1024), t(K, null, {
                                default: l( () => [f(m(s.paymentMethod), 1)]),
                                _: 2
                            }, 1024), t(K, {
                                class: "text-right"
                            }, {
                                default: l( () => [f(m(s.totalAmount), 1)]),
                                _: 2
                            }, 1024)]),
                            _: 2
                        }, 1024)), 64))]),
                        _: 1
                    })]),
                    _: 1
                })]),
                _: 1
            })])
        }
    }
});
export {I as default};
