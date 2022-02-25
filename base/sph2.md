>https://lucasschuermann.com/writing/particle-based-fluid-simulation
http://rlguy.com/sphfluidsim/
http://www.gpusph.org/documentation/theory-guide/
https://suncio.me/2020/10/06/Physical-Simulation-Smoothed-Particle-Hydrodynamics/
### 平滑粒子流体动力学

#### 1 N-s方程:
$$
\rho(\frac{\partial \mathbf{u}}{\partial t}+\mathbf{u}\cdot\nabla\mathbf{u}) = -\nabla p + \eta\nabla^2\mathbf{u}+\rho\mathbf{g}
$$

#### 2 推导
材料导数定义为非线性算子
$$
\frac{D}{Dt}\equiv\frac{\partial}{\partial t}+\mathbf{u}\cdot\nabla
$$

$$
F = ma
$$

$$
m\frac{D\mathbf{u}}{Dt}=\mathbf{F}^{\text{total}}
$$

$$
\rho\frac{D\mathbf{u}}{Dt}=\sum{\mathbf{F}}=\mathbf{F}^{\text{pressure}}+\mathbf{F}^{\text{viscosity}}+\rho\mathbf{g}
$$

$$
\rho\frac{D\mathbf{u}}{Dt} = \rho(\frac{\partial \mathbf{u}}{\partial t}+\mathbf{u}\cdot\nabla\mathbf{u} ) = -\nabla p + \eta\nabla\cdot\nabla\mathbf{u}+\rho\mathbf{g}
$$

#### 3 SPH
SPH 的基本思想来源于积分插值，类似于核密度估计。从本质上讲，SPH 是将流体离散化为离散元素、粒子，在这些元素上，属性通过核函数“平滑”。这意味着平滑半径内的相邻粒子会影响给定粒子的属性，例如压力和密度贡献——这是考虑流体动力学模拟的一种令人惊讶的直观方式。

这个基石核函数给出了任何数量的近似值一种一种在某一点$\mathbf{r}$

$$
A_s(\mathbf{r}) = \int A(\mathbf{r}')W(\mathbf{r}-\mathbf{r}',h)d\mathbf{r}' \approx \sum_{j }A_j\frac{m_j}{\rho_j}W(\mathbf{r}-\mathbf{r}_j,h)
$$


在哪里m_j米 j和\rho_jρ j分别是第 j个粒子的质量和密度，和W(\mathbf{r},h)W ( r ,h )是具有长度的径向对称平滑核HH具有以下属性：
$$
W(-\mathbf{r},h)=W(\mathbf{r},h)) \\
\int W(\mathbf{r})d\mathbf{r}=1
$$

请注意，我们正在对所有其他粒子求和jj. 将其应用于上面讨论的 Navier-Stokes 方程，我们首先必须确定一种基于相邻粒子定义流体密度的方法，尽管这与前面的近似值无关，代入\rhoρ对于任意数量一种一种
$$
\rho_i = \rho(\mathbf{r}_i)=\sum_j m_j\frac{\rho_j}{\rho_j}W(\mathbf{r}_i-\mathbf{r}_j,h) = \sum_j m_jW( \mathbf{r}_i-\mathbf{r}_j,h)
$$


由于导数的线性\nabla∇，任何量的空间导数（梯度）可以很容易地得到如下:
$$
\nabla A(\mathbf{r})=\nabla\sum_jm_j\frac{A_j}{\rho_j}W(\mathbf{r}-\mathbf{r}_j,h)=\sum_jm_j\frac{A_j}{ \rho_j}\nabla W(\mathbf{r}-\mathbf{r}_j,h)
$$

拉普拉斯算子也是如此
$$
\nabla^2 A(\mathbf{r})=\sum_jm_j\frac{A_j}{\rho_j}\nabla^2 W(\mathbf{r}-\mathbf{r}_j,h)
$$


#### 4 SPH 和 Navier-Stokes
根据之前对 Navier-Stokes 方程的讨论，很明显，方程右侧的力密度场（压力、粘度和外部）的总和给出了动量的变化\rho\frac{D\mathbf{u}}{Dt}ρ
时间_
杜_
​
 左侧的粒子。从动量的这种变化，我们可以计算出粒子的加速度一世一世
 $$
 \mathbf{a}_i=\frac{d\mathbf{u}_i}{dt}=\frac{\mathbf{F}_i}{\rho_i}
 $$


因此，我们有兴趣用 SPH 近似 Navier-Stokes 方程的压力和粘度方程的力项，如下所示
$$
\mathbf{F}^{\text{pressure}}_i=-\nabla p(\mathbf{r}_i)=-\sum_jm_im_j(\frac{p_i}{\rho_i^2}+\frac{p_j}{\rho_j^2})\nabla W(\mathbf{r}_i-\mathbf{r}_j,h)
\\
\mathbf{F}^{\text{viscosity}}_i=\eta\nabla^2\mathbf{u}(\mathbf{r}_i)=\eta\sum_jm_j\frac{\mathbf{u}_j-\mathbf{u}_i}{\mathbf{\rho}_j}\nabla^2W(\mathbf{r}_i-\mathbf{r}_j,h)
$$


压力pp使用一些将密度与定义的静止密度相关联的状态方程来计算粒子，通常是泰特方程或理想气体方程，例如
$$
p=k(\rho-\rho_0)
$$


在哪里\rho_0ρ
0
​
 是静止密度和ķķ是一些定义的气体常数，取决于系统的温度。

请注意，这些公式可能会在不同的实施方法和更先进的技术之间发生变化。例如，将 SPH 直接应用于压力项-\nabla p− ∇ p给
$$
\mathbf{F}^{\text{pressure}}_i=-\nabla p(\mathbf{r}_i)=-\sum_jm_j\frac{p_j}{\rho_j}\nabla W(\mathbf{r}_i-\mathbf{r}_j,h)
$$


这是不对称的。考虑两个粒子的情况，其中粒子一世一世将仅使用粒子的压力jj计算其压力，反之亦然。两个粒子位置的压力通常不相等，因此力不对称。上述 SPH 压力方程使用已成为规范对称化（加权和）的公式。在 Müller 的原始论文中，作为参考，对称化是使用算术平均值进行的
$$
\mathbf{F}^{\text{pressure}}_i=-\nabla p(\mathbf{r}_i)=-\sum_jm_j\frac{p_i+p_j}{2\rho_j}\nabla W(\mathbf{r}_i-\mathbf{r}_j,h)
$$


这再次必须在粘度项中解决，它天真地产生了不对称关系
$$
\mathbf{F}^{\text{viscosity}}_i=\eta\sum_jm_j\frac{\mathbf{u}_j}{\rho_j}\nabla^2W(\mathbf{r}_i-\mathbf{r}_j,h)
$$

这是使用速度差异作为一种自然方法来解决的，因为粘性力仅依赖于速度差异而不是绝对速度，绝对速度可以被认为是查看粒子的邻居一世一世从一世一世自己的移动参考系。


#### 5 表面张力
到目前为止，我们已经从基本物理原理对 Navier-Stokes 进行了简要说明，并讨论了将 SPH 用作拉格朗日离散方案，使我们能够模拟压力和粘性力。然而，可信模拟的关键缺失部分是表面张力。表面张力是流体中相邻分子之间吸引力的结果。在流体内部，这些吸引力是平衡的，并被抵消，而在流体表面，它们是不平衡的，产生一个作用在表面法线方向上的净力，通常会最小化流体的曲率。流体表面。这个力的大小取决于表面当前曲率的大小以及一个常数\西格玛σ取决于形成边界的两种流体。

表面张力虽然不存在于不可压缩的 Naiver-Stokes 方程中，但可以通过多种不同的方式显式建模。同样，Müller 等人提出了最常见且可能最容易掌握的方法，该方法通过添加基于上述表面张力物理原理的另一个项来修改 Navier-Stokes 方程
$$
\rho(\mathbf{r}_i)\frac{\mathbf{u}_i}{dt}=-\nabla p(\mathbf{r}_i)+\eta\nabla^2\mathbf{u}(\mathbf{r}_i)+\rho(\mathbf{r}_i)\mathbf{g}(\mathbf{r}_i)\boxed{-\sigma\nabla^2 c_s(\mathbf{r}_i)\frac{\nabla c_s(\mathbf{r}_i)}{|\nabla c_s(\mathbf{r}_i)|}}
$$
