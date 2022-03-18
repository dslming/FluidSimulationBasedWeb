import numpy
from matplotlib import pyplot

dt = .1 # 时间步长
nx = 5 # 离散数量

y = numpy.zeros(nx)
y_pro = numpy.zeros(nx)
y_exact = numpy.zeros(nx)

y[0] = 1
y_pro[0] = 1

# 微分方程 f' = 2y - 1
def fun(y):
  return 2*y-1

# 精确解
for n in range(nx):
  y_exact[n] = 1/2*(numpy.exp(n*2*dt)+1)

# 改进的欧拉
for n in range(nx):
  if n < nx-1:
    y_bar = y_pro[n] + fun(y_pro[n])*dt
    y_pro[n+1] = y_pro[n] + dt/2*( fun(y_bar) + fun(y_pro[n]))

# 前向欧拉
for n in range(nx):
  if n < nx-1:
    y[n+1] = (2*y[n] - 1)*dt + y[n]

# 绘图
pyplot.plot(numpy.linspace(0, dt*nx, nx), y,color='green',linewidth=1.0,linestyle='--',label='forward Euler')
pyplot.plot(numpy.linspace(0, dt*nx, nx), y_pro,color='red',linewidth=1.0,linestyle="-.", label='evolve Euler')
pyplot.plot(numpy.linspace(0, dt*nx, nx), y_exact,color='blue',linewidth=1.0,linestyle='-',label='exact')
pyplot.legend()
pyplot.show()
