import numpy as np
import matplotlib.pyplot as plt


def tridiag(A, Q):
    N = len(Q)
    ans = np.zeros(N)
    d = A.diagonal(0).copy()
    c = A.diagonal(1).copy()
    a = A.diagonal(-1).copy()
    Q = np.copy(Q)
    A = np.copy(A)

    for i in range(1,N):
        const = a[i-1]/d[i-1]
        d[i] = d[i] - const*c[i-1]
        Q[i] = Q[i] - const*Q[i-1]
    ans[N-1] = Q[N-1]/d[N-1]
    for i in range(N-2, -1, -1):
        ans[i] = (Q[i] -c[i]*ans[i+1])/d[i]
    return ans


def gaussian(A, Q):
    # Forward Elimination
    K = len(Q)
    phi = np.zeros(len(Q))

    for k in range(K-1):
        for i in range(k+1,K):
            const = A[i,k]/A[k,k]
            for j in range(k+1,K):
                A[i,j] = A[i,j] - const*A[k,j]
            A[i,k] = const
            Q[i] = Q[i] -const*Q[k]

    # Backward Substitution
    phi[K-1] = Q[K-1]/A[K-1,K-1]
    for i in range(K-2,-1,-1):
        numerator = Q[i]
        for j in range(i+1, K):
            numerator = numerator - A[i,j]*phi[j]
        phi[i] = numerator/A[i,i]
    return phi



if __name__ == "__main__":
    title = "n = 20, Pe = 0.1"
    nx = 20 # 20, 40, 80, 160
    dx = 1.0 / nx
    x = np.linspace(0.0+ dx/2.0, 1-dx/2.0, nx)
    Pe = 0.1 # 0.1, 1.0, 10.0
    phi_L = 0.0
    phi_R = 1.0

    # Analytical solution
    phi_anal = (1.0/(np.exp(Pe)-1))*np.exp(Pe*x) - 1.0/(np.exp(Pe)-1)

    # First-order upwind
    A = np.zeros((nx,nx))
    S = np.zeros(nx)
    for i in range(nx):
        if i == 0:
            A[i,i] = (12 + 3*Pe*dx)
            A[i,i+1] = -4.0
            S[i] = (8 + 3*Pe*dx)*phi_L
        elif i == nx-1:
            A[i,i] = 12.0
            A[i,i-1] = -(4+3*Pe*dx)
            S[i] = (8 -3*Pe*dx)*phi_R
        else:
            A[i,i] = (2 + Pe*dx)
            A[i,i+1] = -1.0
            A[i,i-1] = -(1 + Pe*dx)
            S[i] = 0.0
    phi_upwind_1 = tridiag(A,S)
    error_upwind_1 = phi_anal - phi_upwind_1

   # Second-order upwind
    A = np.zeros((nx,nx))
    S = np.zeros(nx)
    for i in range(nx):
        if i == 0:
            A[i,i] = (12 + 6*Pe*dx)
            A[i,i+1] = -4.0
            S[i] = (8 + 6*Pe*dx)*phi_L
        elif i == 1:
            A[i,i] = (4 + 3*Pe*dx)
            A[i,i+1] = -2.0
            A[i,i-1] = -(2+5*Pe*dx)
            S[i] = -2*Pe*dx*phi_L
        elif i == nx-1:
            A[i,i] = 24.0
            A[i,i-1] = -(8+9*Pe*dx)
            A[i,i-2] = 3*Pe*dx
            S[i] = (16 -6*Pe*dx)*phi_R
        else:
            A[i,i] = (4 + 3*Pe*dx)
            A[i,i+1] = -2.0
            A[i,i-1] = -(2 + 4*Pe*dx)
            A[i,i-2] = Pe*dx
            S[i] = 0.0
    phi_upwind_2 = gaussian(A,S)
    error_upwind_2 = phi_anal - phi_upwind_2

    # QUICK
    A = np.zeros((nx,nx))
    S = np.zeros(nx)
    for i in range(nx):
        if i == 0:
            A[i,i] = (12 + 3*Pe*dx)
            A[i,i+1] = (Pe*dx -4)
            S[i] = (8 + 4*Pe*dx)*phi_L
        elif i == 1:
            A[i,i] = (48 + 10*Pe*dx)
            A[i,i+1] = (9*Pe*dx -24)
            A[i,i-1] = -(24 + 27*Pe*dx)
            S[i] = -8*Pe*dx*phi_L
        elif i == nx-1:
            A[i,i] = (96 -9*Pe*dx)
            A[i,i-1] = -(32 + 18*Pe*dx)
            A[i,i-2] = 3*Pe*dx
            S[i] = (64 -24*Pe*dx)*phi_R
        else:
            A[i,i] = (16 + 3*Pe*dx)
            A[i,i+1] = (3*Pe*dx -8)
            A[i,i-1] = -(8 + 7*Pe*dx)
            A[i,i-2] = Pe*dx
            S[i] = 0.0
    phi_quick = gaussian(A,S)
    error_quick = phi_anal - phi_quick

    fig = plt.figure(figsize=(7,6))
    ax1 = fig.add_subplot(111)
    l1, l2, l3 = ax1.plot( x, phi_upwind_1, 'b', x, phi_upwind_2, 'g', x, phi_quick, 'r')
    ax1.set_ylabel("Phi")
    ax1.set_xlabel("x")

    ax2 = ax1.twinx()
    l4, l5, l6 = ax2.plot(x, error_upwind_1,'b+', x, error_upwind_2,'g+', x, error_quick, 'r+')
    ax2.set_ylabel("Error")
    fig.legend((l1, l4, l2, l5, l3, l6), ('Upwind 1', 'Error Upwind 1', 'Upwind 2', 'Error Upwind 2', 'QUICK', 'Error QUICK'), 'upper left', bbox_to_anchor=(0,1), bbox_transform=ax2.transAxes)
    plt.title(title)
    plt.tight_layout()
    plt.show()
