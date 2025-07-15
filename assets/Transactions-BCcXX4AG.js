import {d as s, e as a, f as e, g as t, h as l, J as u, _ as n, K as _, n as o, I as d, L as i, k as f, M as c, N as r, x as p, G as m} from "./index-DJbHPZ62.js";
import {_ as v, a as x, b as g, c as h, d as y, e as b, f as w, g as j} from "./PopoverItem.vue_vue_type_script_setup_true_lang-6D509ooZ.js";
const k = {
    class: ""
}
  , A = {
    class: "flex items-center justify-between mb-3"
}
  , I = s({
    __name: "Transactions",
    setup(s) {
        const I = [];
        return (s, M) => {
            const z = _
              , D = v
              , J = i
              , S = u
              , T = g
              , C = b
              , E = y
              , G = h
              , H = j
              , K = w
              , L = x
              , N = n;
            return m(),
            a("div", k, [e("div", A, [M[1] || (M[1] = e("h1", {
                class: "font-semibold"
            }, "Histórico de Jogos", -1)), t(S, null, {
                default: l( () => [t(z, null, {
                    default: l( () => [t(o(d).ThreeDotsVertical, {
                        class: "size-6.5 p-1 cursor-pointer transition-transform active:scale-90"
                    })]),
                    _: 1
                }), t(J, {
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
            })]), t(N, {
                class: "px-5.5"
            }, {
                default: l( () => [t(L, null, {
                    default: l( () => [t(T, null, {
                        default: l( () => M[2] || (M[2] = [f("A list of your recent invoices.")])),
                        _: 1,
                        __: [2]
                    }), t(G, null, {
                        default: l( () => [t(E, null, {
                            default: l( () => [t(C, {
                                class: "w-[100px]"
                            }, {
                                default: l( () => M[3] || (M[3] = [f(" Invoice ")])),
                                _: 1,
                                __: [3]
                            }), t(C, null, {
                                default: l( () => M[4] || (M[4] = [f("Status")])),
                                _: 1,
                                __: [4]
                            }), t(C, null, {
                                default: l( () => M[5] || (M[5] = [f("Method")])),
                                _: 1,
                                __: [5]
                            }), t(C, {
                                class: "text-right"
                            }, {
                                default: l( () => M[6] || (M[6] = [f(" Amount ")])),
                                _: 1,
                                __: [6]
                            })]),
                            _: 1
                        })]),
                        _: 1
                    }), t(K, null, {
                        default: l( () => [(m(),
                        a(c, null, r(I, s => t(E, {
                            key: s.invoice
                        }, {
                            default: l( () => [t(H, {
                                class: "font-medium"
                            }, {
                                default: l( () => [f(p(s.invoice), 1)]),
                                _: 2
                            }, 1024), t(H, null, {
                                default: l( () => [f(p(s.paymentStatus), 1)]),
                                _: 2
                            }, 1024), t(H, null, {
                                default: l( () => [f(p(s.paymentMethod), 1)]),
                                _: 2
                            }, 1024), t(H, {
                                class: "text-right"
                            }, {
                                default: l( () => [f(p(s.totalAmount), 1)]),
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
