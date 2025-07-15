import {d as t, e, f as a, O as s, P as o, n as l, Q as r, G as n, R as d, S as c, T as u, t as i, h as p, m as b, q as f} from "./index-DJbHPZ62.js";
const v = {
    "data-slot": "table-container",
    class: "relative w-full overflow-auto"
}
  , m = t({
    __name: "Table",
    props: {
        class: {}
    },
    setup(t) {
        const d = t;
        return (t, c) => (n(),
        e("div", v, [a("table", {
            "data-slot": "table",
            class: o(l(r)("w-full caption-bottom text-sm", d.class))
        }, [s(t.$slots, "default")], 2)]))
    }
})
  , g = t({
    __name: "TableBody",
    props: {
        class: {}
    },
    setup(t) {
        const a = t;
        return (t, d) => (n(),
        e("tbody", {
            "data-slot": "table-body",
            class: o(l(r)("[&_tr:last-child]:border-0", a.class))
        }, [s(t.$slots, "default")], 2))
    }
})
  , x = t({
    __name: "TableCell",
    props: {
        class: {}
    },
    setup(t) {
        const a = t;
        return (t, d) => (n(),
        e("td", {
            "data-slot": "table-cell",
            class: o(l(r)("p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]", a.class))
        }, [s(t.$slots, "default")], 2))
    }
})
  , _ = t({
    __name: "TableHeader",
    props: {
        class: {}
    },
    setup(t) {
        const a = t;
        return (t, d) => (n(),
        e("thead", {
            "data-slot": "table-header",
            class: o(l(r)("[&_tr]:border-b", a.class))
        }, [s(t.$slots, "default")], 2))
    }
})
  , h = t({
    __name: "TableRow",
    props: {
        class: {}
    },
    setup(t) {
        const a = t;
        return (t, d) => (n(),
        e("tr", {
            "data-slot": "table-row",
            class: o(l(r)("hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors", a.class))
        }, [s(t.$slots, "default")], 2))
    }
})
  , w = t({
    __name: "TableHead",
    props: {
        class: {}
    },
    setup(t) {
        const a = t;
        return (t, d) => (n(),
        e("th", {
            "data-slot": "table-head",
            class: o(l(r)("text-muted-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]", a.class))
        }, [s(t.$slots, "default")], 2))
    }
})
  , y = t({
    __name: "TableCaption",
    props: {
        class: {}
    },
    setup(t) {
        const a = t;
        return (t, d) => (n(),
        e("caption", {
            "data-slot": "table-caption",
            class: o(l(r)("text-muted-foreground mt-4 text-sm", a.class))
        }, [s(t.$slots, "default")], 2))
    }
})
  , k = t({
    __name: "PopoverItem",
    props: {
        disabled: {
            type: Boolean
        },
        textValue: {},
        asChild: {
            type: Boolean
        },
        as: {},
        class: {},
        inset: {
            type: Boolean
        },
        variant: {
            default: "default"
        }
    },
    setup(t) {
        const e = t
          , a = d(e, "inset", "variant")
          , o = c(a)
          , v = u();
        function m() {
            v.open.value = !1
        }
        return (t, a) => {
            const d = f;
            return n(),
            i(d, b({
                variant: "ghost"
            }, l(o), {
                onClick: m,
                class: l(r)("w-full !text-left justify-start bg-transparent hover:bg-black/6 dark:hover:bg-white/5 active:scale-96 focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive-foreground data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/40 data-[variant=destructive]:focus:text-destructive-foreground data-[variant=destructive]:*:[svg]:!text-destructive-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-pointer items-center gap-2 rounded-sm px-2.5 py-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 transition-transform", e.class)
            }), {
                default: p( () => [s(t.$slots, "default")]),
                _: 3
            }, 16, ["class"])
        }
    }
});
export {k as _, m as a, y as b, _ as c, h as d, w as e, g as f, x as g};
