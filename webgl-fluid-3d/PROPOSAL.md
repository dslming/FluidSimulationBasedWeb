# WebGL PIC/FLIP Fluid Simulation

There exist WebGL fluid simulations, but the ones that I have seen do not use efficient methods for solving pressure and do not make use of newer WebGL 2 features such as transform feedback. This pressure solve is the most expensive computation in the fluid simulation. In my experience, switching from a naive solve to a Conjugate Gradient with Incomplete Cholesky preconditioner sometimes more than doubles the performance of a CPU solver.

I want to write a fluid solver using WebGL fragment/vertex shaders as compute shaders to implement an efficient PIC/FLIP fluid solver as well as make use of features in WebGL 2 such as transform feedback that would make the solver even more performant.

As this project would rely heavily on compute shaders which WebGL does not have, a stretch goal is to be able to design an abstracted WebGL compute framework to simplify packing/unpacking data and shader creation. Making a fragment shader that did compute was a big obstacle in my WebGL deferred shader project and I hope to make a framework to simplify that process. It would also be great if the framework could easily fall back on WebGL 1 features for more portability.

# WebGL PIC/FLIP 流体模拟

存在 WebGL 流体模拟，但我看到的那些没有使用有效的方法来解决压力问题，也没有使用更新的 WebGL 2 功能，例如变换反馈。这种压力求解是流体模拟中最昂贵的计算。根据我的经验，从一个简单的解切换到一个带有不完全 Cholesky 预条件的共轭梯度有时会使 CPU 解算器的性能提高一倍以上。
我想编写一个使用 WebGL 片段/顶点着色器作为计算着色器的流体解算器，以实现高效的 PIC/FLIP 流体解算器，并利用 WebGL 2 中的功能，例如变换反馈，使解算器的性能更高。
由于该项目将严重依赖 WebGL 没有的计算着色器，因此扩展目标是能够设计一个抽象的 WebGL 计算框架，以简化数据打包/解包和着色器创建。在我的 WebGL 延迟着色器项目中，制作一个能够进行计算的片段着色器是一个很大的障碍，我希望制作一个框架来简化这个过程。如果该框架能够轻松地依靠 WebGL 1 的功能实现更高的可移植性，那也将是一件好事。
