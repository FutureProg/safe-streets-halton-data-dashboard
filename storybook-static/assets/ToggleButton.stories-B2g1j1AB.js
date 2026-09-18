import{T as x}from"./ToggleButton-CNsYMIzU.js";import{T}from"./_virtual_next-image_L2hvbWUvcnVubmVyL3dvcmsvc2FmZS1zdHJlZXRzLWhhbHRvbi1kYXRhLWRhc2hib2FyZC9zYWZlLXN0cmVldHMtaGFsdG9uLWRhdGEtZGFzaGJvYXJkL3NyYy9pbWcvaWNvbi1jaXR5LnN2Zw-Movms7bT.js";import"./iframe-BznCjehl.js";import"./preload-helper-Dp1pzeXC.js";import"./index-DaxXqyzA.js";import"./image-DV4IVvLa.js";const s="data:image/svg+xml,%3csvg%20width='14'%20height='16'%20viewBox='0%200%2014%2016'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M11.375%206.5C11.375%207.93438%2010.9676%209.25938%2010.2812%2010.3344L13.743%2014.2937C14.0848%2014.6844%2014.0848%2015.3188%2013.743%2015.7094C13.4012%2016.1%2012.8461%2016.1%2012.5043%2015.7094L9.04258%2011.75C8.10195%2012.5375%206.94258%2013%205.6875%2013C2.5457%2013%200%2010.0906%200%206.5C0%202.90937%202.5457%200%205.6875%200C8.8293%200%2011.375%202.90937%2011.375%206.5ZM5.6875%2011C6.20458%2011%206.7166%2010.8836%207.19432%2010.6575C7.67204%2010.4313%208.1061%2010.0998%208.47173%209.68198C8.83736%209.26412%209.1274%208.76804%209.32528%208.22208C9.52315%207.67611%209.625%207.09095%209.625%206.5C9.625%205.90905%209.52315%205.32389%209.32528%204.77792C9.1274%204.23196%208.83736%203.73588%208.47173%203.31802C8.1061%202.90016%207.67204%202.56869%207.19432%202.34254C6.7166%202.1164%206.20458%202%205.6875%202C5.17042%202%204.6584%202.1164%204.18068%202.34254C3.70296%202.56869%203.2689%202.90016%202.90327%203.31802C2.53764%203.73588%202.2476%204.23196%202.04972%204.77792C1.85185%205.32389%201.75%205.90905%201.75%206.5C1.75%207.09095%201.85185%207.67611%202.04972%208.22208C2.2476%208.76804%202.53764%209.26412%202.90327%209.68198C3.2689%2010.0998%203.70296%2010.4313%204.18068%2010.6575C4.6584%2010.8836%205.17042%2011%205.6875%2011Z'%20fill='black'/%3e%3c/svg%3e",I={src:s,height:16,width:14,blurDataURL:s},{expect:o,fn:b,userEvent:y,within:f}=__STORYBOOK_MODULE_TEST__,H={component:x},e={args:{icon:T,alt:"Test Image",onToggle:b()},play:async({args:C,canvasElement:v,step:w})=>{const n=f(v);o(n.getByRole("button")).toHaveAttribute("data-toggled","false"),await w("Click",async()=>{await y.click(n.getByRole("button"))}),o(C.onToggle).toHaveBeenCalledOnce(),o(n.getByRole("button")).toHaveAttribute("data-toggled","true")}},t={args:{icon:{toggled:T,untoggled:I},alt:"Test Image"}},a={args:{text:"Test Toggle",alt:"Test Image"}},k=["Default","TwoIcons","Text"];var r,g,c;e.parameters={...e.parameters,docs:{...(r=e.parameters)==null?void 0:r.docs,source:{originalSource:`{
  args: {
    icon: TestImage,
    alt: "Test Image",
    onToggle: fn()
  },
  play: async ({
    args,
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole('button')).toHaveAttribute('data-toggled', 'false');
    await step('Click', async () => {
      await userEvent.click(canvas.getByRole('button'));
    });
    expect(args.onToggle).toHaveBeenCalledOnce();
    expect(canvas.getByRole('button')).toHaveAttribute('data-toggled', 'true');
  }
}`,...(c=(g=e.parameters)==null?void 0:g.docs)==null?void 0:c.source}}};var l,i,m;t.parameters={...t.parameters,docs:{...(l=t.parameters)==null?void 0:l.docs,source:{originalSource:`{
  args: {
    icon: {
      toggled: TestImage,
      untoggled: TestImage2
    },
    alt: "Test Image"
  }
}`,...(m=(i=t.parameters)==null?void 0:i.docs)==null?void 0:m.source}}};var p,d,u;a.parameters={...a.parameters,docs:{...(p=a.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    text: "Test Toggle",
    alt: "Test Image"
  }
}`,...(u=(d=a.parameters)==null?void 0:d.docs)==null?void 0:u.source}}};export{e as Default,a as Text,t as TwoIcons,k as __namedExportsOrder,H as default};
//# sourceMappingURL=ToggleButton.stories-B2g1j1AB.js.map
