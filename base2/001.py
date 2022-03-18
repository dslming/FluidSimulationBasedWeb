# 前向欧拉
import numpy                       #here we load numpy
from matplotlib import pyplot      #here we load matplotlib
import time, sys                   #and load some utilities

#解决中文显示问题
pyplot.rcParams['font.sans-serif'] = ['Arial Unicode MS']

dt = .1
nx = 10

y = numpy.zeros(nx)
y_exact = numpy.zeros(nx)

y[0] = 1

for n in range(nx):
  y_exact[n] = 1/2*(numpy.exp(n*2*dt)+1)
  if n > 0:
    y[n] = (2*y[n-1] - 1)*dt + y[n-1]

pyplot.plot(numpy.linspace(0, dt*nx, nx), y,color='red',linewidth=1.0,linestyle='--',label='前向欧拉')

pyplot.plot(numpy.linspace(0, dt*nx, nx), y_exact,color='blue',linewidth=1.0,linestyle='-',label='解析解')
pyplot.legend()

while True:
  pyplot.pause(0.05)
