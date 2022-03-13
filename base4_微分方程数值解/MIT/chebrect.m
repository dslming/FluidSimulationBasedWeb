function intor = chebrect(n,z)
% Uses n quadrature points to evaluate the integral of 1/R over the 2x2 square, 
% for an evaluation point a distance z above the center of the square.

% Uses Chebfun to generate Chebyshev points and weights on interval [-1,1]
[x,w] = chebpts(n,[-1,1]);
w = w(:); % Makes w in to a column vector.

% Using Kronecker products to compute points and weights
% for points in 2-D
o = ones(n,1);
xp = kron(o,x);
wxp = kron(o,w);
yp = kron(x,o);
wyp = kron(w,o);

% Do the integration for a distance z from a rectangle from [-1,1]
% Note all the by-element operations (.*, ./, .^2, etc.).
intor = sum((wxp.*wyp)./sqrt(xp.^2 + yp.^2 + z^2));
end


