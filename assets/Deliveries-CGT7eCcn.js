import {d as s, e, f as a, g as t, h as l, J as u, _ as n, K as _, n as o, I as d, L as i, k as f, M as r, N as c, x as p, G as m} from "./index-DJbHPZ62.js";
import {_ as v, a as x, b as g, c as h, d as y, e as b, f as w, g as j} from "./PopoverItem.vue_vue_type_script_setup_true_lang-6D509ooZ.js";
const k = {
    class: ""
}
  , A = {
    class: "flex items-center justify-between mb-3"
}
  , D = s({
    __name: "Deliveries",
    setup(s) {
        const D = [];
        return (s, I) => {
            const M = _
              , z = v
              , J = i
              , S = u
              , C = g
              , E = b
              , G = y
              , H = h
              , K = j
              , L = w
              , N = x
              , P = n;
            return m(),
            e("div", k, [a("div", A, [I[1] || (I[1] = a("h1", {
                class: "font-semibold"
            }, "Histórico de Jogos", -1)), t(S, null, {
                default: l( () => [t(M, null, {
                    default: l( () => [t(o(d).ThreeDotsVertical, {
                        class: "size-6.5 p-1 cursor-pointer transition-transform active:scale-90"
                    })]),
                    _: 1
                }), t(J, {
                    class: "p-2 w-[240px] space-y-2",
                    align: "end",
                    "side-offset": 12
                }, {
                    default: l( () => [t(z, {
                        onClick: () => {}
                    }, {
                        default: l( () => [t(o(d).Download, {
                            class: "size-[1.2em]"
                        }), I[0] || (I[0] = f(" Exportar resultados "))]),
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
                    default: l( () => [t(C, null, {
                        default: l( () => I[2] || (I[2] = [f("A list of your recent invoices.")])),
                        _: 1,
                        __: [2]
                    }), t(H, null, {
                        default: l( () => [t(G, null, {
                            default: l( () => [t(E, {
                                class: "w-[100px]"
                            }, {
                                default: l( () => I[3] || (I[3] = [f(" Invoice ")])),
                                _: 1,
                                __: [3]
                            }), t(E, null, {
                                default: l( () => I[4] || (I[4] = [f("Status")])),
                                _: 1,
                                __: [4]
                            }), t(E, null, {
                                default: l( () => I[5] || (I[5] = [f("Method")])),
                                _: 1,
                                __: [5]
                            }), t(E, {
                                class: "text-right"
                            }, {
                                default: l( () => I[6] || (I[6] = [f(" Amount ")])),
                                _: 1,
                                __: [6]
                            })]),
                            _: 1
                        })]),
                        _: 1
                    }), t(L, null, {
                        default: l( () => [(m(),
                        e(r, null, c(D, s => t(G, {
                            key: s.invoice
                        }, {
                            default: l( () => [t(K, {
                                class: "font-medium"
                            }, {
                                default: l( () => [f(p(s.invoice), 1)]),
                                _: 2
                            }, 1024), t(K, null, {
                                default: l( () => [f(p(s.paymentStatus), 1)]),
                                _: 2
                            }, 1024), t(K, null, {
                                default: l( () => [f(p(s.paymentMethod), 1)]),
                                _: 2
                            }, 1024), t(K, {
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
export {D as default};
