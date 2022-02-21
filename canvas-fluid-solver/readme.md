doc
https://esimov.com/2014/01/navier-stokes-fluid-simulation-on-html5-canvas#.YhEMAJNBwV8

https://www.gamasutra.com/view/feature/1549/practical_fluid_dynamics_part_1.php?print=1

https://mikeash.com/pyblog/fluid-simulation-for-dummies.html

### 不可压缩流体模拟

#### Diffusion(扩散)

扩散是一个过程——在我们的例子中——液体不会静止不动，而是扩散开来。通过扩散，每个细胞与其直接邻居交换密度。密度数组由用户的鼠标移动填充。单元格的密度会因失去其邻居的密度而降低，但也会因从邻居流入的密度而增加。

#### Projection(投影)

这意味着流入的流体量必须与流出的流体量完全相等，否则可能会发生某些单元格中的净流入量高于或低于相邻单元格的净流入量。这可能会导致模拟反应完全混乱。此操作贯穿所有单元并将它们固定以保持平衡。

#### Advection(平流)

平流背后的关键思想是，如果将密度建模为一组粒子，则移动密度将很容易解决。在这种情况下，我们只需通过速度场追踪粒子。例如，我们可以假设每个网格单元的中心是一个粒子，并通过速度场追踪它。所以平流实际上是应用于每个网格单元的速度。这就是使事情发生变化的原因。

setBoundary():
