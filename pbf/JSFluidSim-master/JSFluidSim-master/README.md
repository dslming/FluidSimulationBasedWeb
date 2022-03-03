# SPH-FluidSolver-WebGL

This is an implementation of "Position Based Fluids" by Muller et al. in JavaScipt.

It uses work from:

http://mmacklin.com/pbf_sig_preprint.pdf

http://matthias-mueller-fischer.ch/publications/sca03.pdf

http://wwwcg.in.tum.de/fileadmin/user_upload/Lehrstuehle/Lehrstuhl_XV/Research/Publications/2013/CreepingOctreeGrid/OctreeFluidSCA2014.pdf

and http://www.cs.cornell.edu/courses/cs5643/2014sp/stuff/BridsonFluidsCourseNotes_SPH_pp83-86.pdf


# Current Status

The canvas based demo is currently working.  It can currently do 2000 particles on my machine at 10fps.

Just run 2DDemo.html to view.

This project has been abandoned because I want to implment a PIC/FLIP method instead, and some aspect inherent to SPH-based-methods make this extremely difficult without OpenCL/CUDA/Compute Shaders (paralell sort).