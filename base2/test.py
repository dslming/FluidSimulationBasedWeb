# https://blog.csdn.net/yangmaoda/article/details/120448939

import numpy as np
from matplotlib import pyplot as plt
from scipy.integrate import odeint
#梯形算法

def f(x,y):
    return y-2*x/y
def diff_equation(y, x):
    return np.array(y - 2 * x / y)
h=0.1
# x = np.linspace(0, 1, num=10)
x=[x/10 for x in range(0,11)]
n=np.size(x)
y=np.zeros([1,n+1])
t=np.zeros([1,n])
y[0,0]=1
t = odeint(diff_equation, 1, x)  # 利用python内置函数求解该常微分方程
for i in range(n):
    yp=y[0,i]+h*f(x[i],y[0,i])
    yc=y[0,i]+h*f(x[i]+h,yp)
    y[0,i+1]=0.5*(yp+yc)
print(y)
print(t)
plt.figure(1)
plt.grid()
plt.plot(x, y[0,0:n],label='evolve-Euler')
plt.plot(x, t[:,0],color='red',linestyle='--',label='Standard value')


h=0.1
y=1
x=0
xx = []
yy = []
for i in range(100):
    y=1.1*y-0.2*x/y
    x=x+h
    xx.append(x)
    yy.append(y)
    if(x>1):
        break
plt.plot(xx,yy,color='brown',linestyle='--',label='Euler')
plt.legend(loc='upper right')
plt.show()
