# 前向欧拉
import numpy                       #here we load numpy
from matplotlib import pyplot      #here we load matplotlib
import time, sys                   #and load some utilities


dt = .1 # 时间步长
nx = 10 # 离散数量

y = numpy.zeros(nx)
y_exact = numpy.zeros(nx)

y[0] = 1

for n in range(nx):
  y_exact[n] = 1/2*(numpy.exp(n*2*dt)+1)
  if n<nx-1:
    y[n+1] = (2*y[n] - 1)*dt + y[n]

pyplot.plot(numpy.linspace(0, dt*nx, nx), y,color='red',linewidth=1.0,linestyle='--',label='forward Euler')

pyplot.plot(numpy.linspace(0, dt*nx, nx), y_exact,color='blue',linewidth=1.0,linestyle='-',label='exact')
pyplot.legend()

while True:
  pyplot.pause(0.05)
