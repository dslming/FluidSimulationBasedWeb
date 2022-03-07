### Learn [Fluid Simulation for Computer Graphics](https://link)

#### 1 流体方程

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
$\rho(x,y,t)$ 液体密度, $1000kg/m^3$
$p$ 压力 (常数),
$\mu$ 是运动粘度 (常数)
g 重力, (0,-9.8) $m/s^2$

#### 2 动量方程

式(1-1)称为动量方程,是$F = ma$的变形, 描述了力与加速度的关系,
式(1-2) 称为不可压缩条件

考虑一个粒子, 质量 m，体积 V，速度 u，

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


$$

#### 3 拉格朗日和欧拉视角

$$
$$
