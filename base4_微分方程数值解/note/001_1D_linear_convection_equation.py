import numpy                       #here we load numpy
from matplotlib import pyplot      #here we load matplotlib
import time, sys                   #and load some utilities

# try changing this number from 41 to 81 and Run All ... what happens?
nx = 51
dx = 2 / (nx-1)

#nt is the number of timesteps we want to calculate
nt = 25

#dt is the amount of time each timestep covers (delta t)
dt = .025

#assume wavespeed of c = 1
c = 1


#numpy function ones()
u = numpy.ones(nx)
#setting u = 2 between 0.5 and 1 as per our I.C.s
u[int(.5 / dx):int(1 / dx + 1)] = 2
print(u)

pyplot.plot(numpy.linspace(0, 2, nx), u)


un = numpy.ones(nx) #initialize a temporary array

for n in range(nt):  #loop for values of n from 0 to nt, so it will run nt times
    un = u.copy() ##copy the existing values of u into un
    for i in range(1, nx): ## you can try commenting this line and...
    # for i in range(nx): ## ... uncommenting this line and see what happens!
      u[i] = un[i] - c * dt / dx * (un[i] - un[i-1])

pyplot.plot(numpy.linspace(0, 2, nx), u)
pyplot.show()
