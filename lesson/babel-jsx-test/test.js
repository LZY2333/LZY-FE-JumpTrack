// 使用方法:
// 1. npm install
// 2. node test.js

const babel = require('@babel/core');
const React = require('react');

// 统一编译函数：classic runtime，允许顶层 return（演示二需要）
const compile = (src) =>
  babel.transformSync(src, {
    parserOpts: { allowReturnOutsideFunction: true },
    plugins: [['@babel/plugin-transform-react-jsx', { runtime: 'classic' }]],
  }).code;

// ============================================================
// 执行区 - 注释掉不想运行的演示
// ============================================================
demo1();
demo2();
demo3();
demo4();
demo5();
demo6();

// ============================================================
// 演示一：JSX 编译结果 + 执行后的虚拟 DOM
// ============================================================
function demo1() {
  const sourceCode = `
<h1>
  hello
  <span style={{ color: 'red' }}>
    world
  </span>
</h1>
`;
  const compiled = compile(sourceCode);
  console.log('===== 演示一：JSX 编译结果 =====');
  console.log(compiled);

  // 去掉尾分号再用括号包裹，避免 return (...;) 语法错误
  const fn = new Function('React', `return (${compiled.replace(/;\s*$/, '')})`);
  const vnode = fn(React);
  console.log('===== 演示一：执行后的虚拟 DOM =====');
  console.dir(vnode, { depth: null });
}

// ============================================================
// 演示二：组件编译 + 引用编译 + 执行后的虚拟 DOM
// ============================================================
function demo2() {
  // 第一步：编译自定义组件，得到组件的编译结果
  const componentSource = `
function Card(props) {
  return (
    <div className="card">
      <h2>{props.title}</h2>
      {props.children}
    </div>
  );
}
`;
  const compiledComponent = compile(componentSource);
  console.log('\n===== 演示二：组件编译结果 =====');
  console.log(compiledComponent);

  // 第二步：把「组件编译结果」+「引用它的 JSX」拼起来再次编译
  const combined = compiledComponent + '\nreturn (<Card title="标题"><p>内容</p></Card>);';
  const compiledAll = compile(combined);
  console.log('\n===== 演示二：组件 + 引用编译结果 =====');
  console.log(compiledAll);

  // 第三步：执行得到虚拟 DOM
  const fn = new Function('React', compiledAll);
  const vnode = fn(React);
  console.log('\n===== 演示二：执行后的虚拟 DOM =====');
  console.dir(vnode, { depth: null });
}

// ============================================================
// 演示三：classic runtime vs automatic runtime 对比
// ============================================================
function demo3() {
  const sourceCode = `<div className="box"><span>hello</span></div>`;

  const classicCode = babel.transformSync(sourceCode, {
    parserOpts: { allowReturnOutsideFunction: true },
    plugins: [['@babel/plugin-transform-react-jsx', { runtime: 'classic' }]],
  }).code;

  const automaticCode = babel.transformSync(sourceCode, {
    parserOpts: { allowReturnOutsideFunction: true },
    plugins: [['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]],
  }).code;

  console.log('\n===== 演示三：classic runtime 编译结果 =====');
  console.log(classicCode);
  console.log('\n===== 演示三：automatic runtime 编译结果 =====');
  console.log(automaticCode);
  console.log('\n=> classic 产出 React.createElement，需手动 import React');
  console.log('=> automatic 产出 _jsx（来自 react/jsx-runtime），React 17+ 无需手动 import');
}

// ============================================================
// 演示四：Fragment <></> 编译
// ============================================================
function demo4() {
  const sourceCode = `
<>
  <h1>title</h1>
  <p>content</p>
</>
`;
  const compiled = compile(sourceCode);
  console.log('\n===== 演示四：Fragment 编译结果 =====');
  console.log(compiled);

  const fn = new Function('React', `return (${compiled.replace(/;\s*$/, '')})`);
  const vnode = fn(React);
  console.log('\n===== 演示四：执行后的虚拟 DOM =====');
  console.dir(vnode, { depth: null });
}

// ============================================================
// 演示五：spread props 编译
// ============================================================
function demo5() {
  const componentSource = `
function Box(props) {
  return <div {...props} className="override" />;
}
`;
  const compiledComponent = compile(componentSource);
  console.log('\n===== 演示五：spread props 组件编译结果 =====');
  console.log(compiledComponent);

  const combined = compiledComponent + '\nreturn <Box id="box" style={{ color: "blue" }} />;';
  const compiledAll = compile(combined);
  console.log('\n===== 演示五：组件 + 引用编译结果 =====');
  console.log(compiledAll);

  const fn = new Function('React', compiledAll);
  const vnode = fn(React);
  console.log('\n===== 演示五：执行后的虚拟 DOM =====');
  console.dir(vnode, { depth: null });
}

// ============================================================
// 演示六：条件渲染 + 列表渲染编译
// ============================================================
function demo6() {
  const componentSource = `
function List({ show, items }) {
  return (
    <ul>
      {show && <span>visible</span>}
      {items.map(item => <li key={item.id}>{item.name}</li>)}
    </ul>
  );
}
`;
  const compiledComponent = compile(componentSource);
  console.log('\n===== 演示六：条件渲染 + 列表渲染组件编译结果 =====');
  console.log(compiledComponent);

  const combined =
    compiledComponent + '\nreturn <List show={true} items={[{ id: 1, name: "foo" }, { id: 2, name: "bar" }]} />;';
  const compiledAll = compile(combined);
  console.log('\n===== 演示六：组件 + 引用编译结果 =====');
  console.log(compiledAll);

  const fn = new Function('React', compiledAll);
  const vnode = fn(React);
  console.log('\n===== 演示六：执行后的虚拟 DOM =====');
  console.dir(vnode, { depth: null });
}
