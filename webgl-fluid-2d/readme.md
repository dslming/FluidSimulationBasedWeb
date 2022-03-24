> https://yuanming-hu.github.io/fluid/

介绍
这是一个基于 GPU 的流体模拟器。它通过 WebGL 访问用户的本地 GPU。实现了几种模拟方法：Marker & Cell(Eulerian)、Particle in Cell (Hybrid)、Fluid Implicit Particles (Hybrid)。作者写了这个项目，因为他认为在他的浏览器中玩水很有趣。

压力由阻尼雅可比迭代求解器而不是传统的 ICCG 求解。与 ICCG 相比，阻尼 Jacobi 对遗留 API 更加友好，更易于实现。最重要的是，它到目前为止运行良好。如有必要，将来可能会实施多网格压力求解器。请注意，如果 Jacobi 迭代太少，则流体看起来是可压缩的。“暖启动”是指使用最后一步的压力作为当前步骤的初始值，这大大减少了所需的迭代次数。

目前，存在一些已知问题，例如流体体积缓慢收缩。对此的一种补救措施可能是对压力进行一些调整并重新植入颗粒。但是，由于 WebGL 不支持原子操作，因此添加重新播种策略可能相当具有挑战性。

这个模拟器的代码主要是用 CoffeeScript 和 GLSL 编写的。React.js 用于用户界面。作者将 React-toolbox 用于遵循 Google 的 Material Design 的组件。

玩得开心！欢迎反馈！:->
