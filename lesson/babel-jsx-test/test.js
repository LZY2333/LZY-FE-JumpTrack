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
// 演示一：JSX 编译结果 + 执行后的虚拟 DOM
// ============================================================
{
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
{
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
  const combined =
    compiledComponent + '\nreturn (<Card title="标题"><p>内容</p></Card>);';
  const compiledAll = compile(combined);
  console.log('\n===== 演示二：组件 + 引用编译结果 =====');
  console.log(compiledAll);

  // 第三步：执行得到虚拟 DOM
  const fn = new Function('React', compiledAll);
  const vnode = fn(React);
  console.log('\n===== 演示二：执行后的虚拟 DOM =====');
  console.dir(vnode, { depth: null });
}
