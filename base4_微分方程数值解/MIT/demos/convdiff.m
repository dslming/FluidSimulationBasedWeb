function convDiff(U, kappa)
    N = 2^14;
    dt = 0.05;
    M = 1000;

    figure();
    title(sprintf('U=%5.2f, \\kappa=%5.2f, t=%5.2f', U, kappa, 0));
    [x, u] = drawperiodicfunction(N, 'u');
    %[x, f] = drawperiodicfunction(N, 'f');

    uF = fft(u);
    uF = uF(1:N/2);

    %fF = fft(f);
    %fF = fF(1:N/2);

    for i = 1:M
        t = i * dt;
        uFt = uF .* exp(-1j * U * t * [0:N/2-1]) ...   % convection
                 .* exp(-kappa * t * [0:N/2-1].^2);    % diffusion
        uFt = [uFt, 0, conj(uFt(end:-1:2))];
        ut = ifft(uFt);
        cla();
        h = line(x, ut);
        set(h, 'LineWidth', 3);
        set(h, 'color', 'r');
        title(sprintf('U=%5.2f, \\kappa=%5.2f, t=%5.2f', U, kappa, t));
        pause(0.05);
    end