### Smoothed Particle Hydrodynamics

code:
https://github.com/novalain/sph-fluid-webgl
https://github.com/mjwatkins2/WebGL-SPH
https://ttnghia.github.io/posts/sph-fluid-simulation-v2/
https://magnum.graphics/showcase/fluidsimulation3d/
https://pcisph-wasm.netlify.app/

ref:
http://rlguy.com/sphfluidsim/
https://lucasschuermann.com/writing/implementing-sph-in-2d

$$ {\large p*i = \sum*{j}^{ } m*jW*{ij} } $$

$$ {\large W\_{ij} = \frac{315}{64\pi h^9}\left( h^2 - r^2 \right)^3 } $$

$$ {\large P = K\left ( p - p_0 \right ) } $$

$$ {\large a*i = -\sum*{j}^{ }\frac{m*j}{m_i}\frac{P_i + P_j} {2p_ip_j}\bigtriangledown W*{ij} \hat{r}\_{ij} } $$

$$ {\large \bigtriangledown W\_{ij} = -\frac{45}{\pi h^6}\left ( h - r \right )^2 } $$

$$ {\large a*{v_i} = \epsilon \sum*{j}^{ }\frac{m*j}{m_i}\frac{1}{p_j} \left ( v_j - v_i \right ) \bigtriangledown^2 W*{ij} \hat{r}\_{ij} } $$

$$ {\large W\_{ij} = -\frac{r^3}{2h^3} + \frac{r^2}{h^2} + \frac{h}{2r} - 1 } $$

$$ {\large \bigtriangleup t = \max\left ( \frac{Ch}{v*{\text{max}}}, \sqrt{\frac{h}{a*{\text{max}}}}, \frac{Ch}{c\_{\text{max}}} \right ) } $$

$$ {\large c = \sqrt{\frac{ \gamma P}{p}} } $$

$$ {\large \text{hash} = 541i + 79j + 31k } $$
