> https://yangwc.com/2019/05/01/fluidSimulation/#4%E3%80%81%E4%B8%8D%E5%8F%AF%E5%8E%8B%E7%BC%A9%E6%80%A7

$$
\frac{\partial \vec u}{\partial t}+\vec u\cdot \nabla \vec u+\frac1\rho \nabla p=\vec g+\nu \nabla \cdot \nabla \vec u
\tag {2.1}
$$

#### 不可压缩条件

任取流体的一部分，设其体积为$\Omega$而其边界闭合曲面为$\partial \Omega$，我们可以通过围绕边界曲面$\partial \Omega$, 对流体速度$\vec u$ 在曲面法线方向上的分量进行积分来衡量这块部分流体的体积变化速率：

$$
\frac d{dt}Volume(\Omega)=\int\int_{\partial\Omega}\vec u\cdot n \tag{2.12}
$$

对于不可压缩的流体，其体积保持为某个常量，故其体积变化速率为 0:

$$
\int\int_{\partial\Omega}\vec u\cdot n=0 \tag {2.13}
$$

由高斯散度定理，我们可以把式(2.13)转换为体积分：

$$
\int\int_{\partial\Omega}\vec u\cdot n=\int\int\int_\Omega∇\cdot \vec u=0 \tag{2.14}
$$

式(13)应该对任意的$\Omega$成立，意即无论$\Omega$取何值，积分值均为 0。这种情况下只有令积分函数值取 0 方可成立，即对 0 积分无论$\Omega$取何值结果均为 0。所以有：

$$
\nabla \cdot \vec u=0 \tag{2.15}
$$

满足不可压缩条件的速度场被称为是无散度的，即在该速度场下流体体积既不膨胀也不坍缩，而是保持在一个常量。模拟不可压缩流体的关键部分就是使得流体的速度场保持无散度的状态，这也是流体内部压力的来源。
为了把压力与速度场的散度联系起来，我们在动量方程(2.1)两边同时取散度:

$$
\nabla \cdot\frac{\partial \vec u}{\partial t}+\nabla \cdot(\vec u\cdot \nabla \vec u)+\nabla \cdot\frac1\rho \nabla p= \nabla \cdot(\vec g+\nu \nabla \cdot \nabla \vec u) \tag {2.16}
$$

对于上式(2.16)第一项，我们转变一下求导次序：

$$
\frac {\partial}{\partial t} \nabla \cdot\vec u \tag {2.17}
$$

如果满足流体不可压缩条件，那么式(2.17)取值 0（因为无散度），然后我们调整一下式(2.16)可得关于压力的方程：

$$
 \nabla \cdot\frac1\rho \nabla p=
 \nabla \cdot(-\vec u\cdot  \nabla \vec u+\vec g+\nu \cdot \nabla \vec u) \tag{2.18}
$$
