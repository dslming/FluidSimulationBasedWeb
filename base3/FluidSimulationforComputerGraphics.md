### Learn [Fluid Simulation for Computer Graphics](https://link)

#### 1 流体方程

动画中感兴趣的⼤多数流体流动都由著名的可压缩 Navier-Stokes ⽅程控制，这是
一组应该在整个流体中保持的偏微分⽅程。⽅程通常写成

$$
\frac{\partial\boldsymbol{u}}{\partial t} +
(\boldsymbol{u} \cdot \nabla)\boldsymbol{u} = -
\frac{1}{\rho}\nabla p+ \mu \nabla^2\boldsymbol{u} + g
\tag{1-1}
$$

$$
\nabla \cdot \boldsymbol{u} = 0
\tag{1-2}
$$

$\boldsymbol{u}(u,v,w)$ 速度矢量
$\rho(x,y,t)$ 液体密度, 水是$1000kg/m^3$
$p$ 压力 (常数), 即流体对任何物体施加的每单位面积的力
$\mu$ 是运动粘度 (常数)
$g$ 重力, (0,-9.8) $m/s^2$

#### 2 动量方程

- 式(1-1)称为动量方程,是$F = ma$的变形, 描述了力与加速度的关系,它告诉我们流体如何由于作⽤在其上的力⽽改变加速度

- 式(1-2) 称为不可压缩条件

⾸先假设正在使⽤粒⼦系统, 实验）。每个粒⼦可能代表一⼩块流体, 它的质量是 $m$, 体积 $V$,速$u$,粒⼦如何加速:

$$
a = \frac{ D u}{ D t}
$$

D 表示物质导数:

$$
F = m \frac{ D u}{ D t}
$$

粒子受到的力:

- 重力
- 压力,粒子两侧压力不相等时,由高压区推向低压区,测量不同位置压力不平衡采用压力的负梯度$-\nabla $
- 粘度,是一种试图让**目标粒子**成为**周围粒子**平均速度移动的力,衡量一个量与其周围值平均的距离微分算子是拉普拉斯算子:$\nabla \cdot \nabla$,

总而言之,方程变成:

$$
m \frac{ D\boldsymbol{u}}{ D t} =
 m\boldsymbol{g} -
 V \nabla p +
 V \mu \nabla \cdot \nabla \boldsymbol{u}
$$

记密度$\rho = m/V$两边同除体积$V$:

$$
\rho \frac{ D\boldsymbol{u}}{ D t} =
 \rho \boldsymbol{g} -
  \nabla p +
  \mu \nabla \cdot \nabla \boldsymbol{u}
$$

我们⼏乎已经回到动量⽅程了！事实上，这种使⽤物质导数 D/Dt 的形式实际上对我们在计算机图形学中更为重要，并将指导我们以数值⽅式。

#### 3 拉格朗日和欧拉视角

我们将从拉格朗⽇描述开始:

位置为$\boldsymbol{x}$, 速度为 $\boldsymbol{u}, $通⽤量为$q$ 可能是密度/温度或其他量。

函数 $q(t, \boldsymbol{x})$表示: 粒⼦在位置 $x$, 时间 t 刻的 q 值

这是一个欧拉变量，因为它是空间的函数，⽽不是粒⼦的函数。那么对于
位置由 x(t) 作为时间函数给出的粒⼦，q 的变化速度有多快，即拉格朗⽇问题？只需取总导数（⼜名链式法则)

$$
\begin{aligned}
  \frac{d}{dt} q(t,\boldsymbol{x(t)}) &=
   \frac{\partial q}{\partial t} +
\nabla q \cdot \frac{d\boldsymbol{x}}{dt} \\
&=  \frac{\partial q}{\partial t} + \nabla q \cdot \boldsymbol{u} \\
&= \frac{Dq}{Dt}
\end{aligned}
$$

这就是物质导数, 第一项是空间固定点的变化率(欧拉视角), 第二项是流过的差异。

完整的偏导数:

$$
\frac{Dq}{Dt} = \frac{\partial q}{\partial t} +
 u \frac{\partial q}{\partial x} +
 v \frac{\partial q}{\partial y} +
 w \frac{\partial q}{\partial z}
$$

变量 q 随速度场 u 的变化称为**平流(advection)**

**例子:**
我们将使⽤ T 代替 q 来表⽰,温度曲线为:

$$
T (x) = 10x
$$
