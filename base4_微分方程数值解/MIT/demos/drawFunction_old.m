function [x, u] = drawFunction(x0, x1, N, uName)
% [x, u] = drawPeriodicFunction(N, uName);
% User draw a periodic function on screen using mouse.
% Inputs  N: number of points in the returned function
%         uName: name of function (displayed)
% Returns x: N equally spaced points in [0, 2*pi)
%         u: function values at x.
    xlim([x0, x1]);
    ylim([-1, 1]);
    xlabel('x');
    ylabel(uName);
    grid;

    % callback functions are on the bottom of this file
    set(gcf, 'WindowButtonDownFcn',@down);
    set(gcf, 'WindowButtonUpFcn',@up);
    set(gcf, 'WindowButtonMotionFcn',@motion);
    set(gca, 'UserData', [0]); % 0: blank, 1: drawing, 2: done
    
    % wait until mouse up
    finished = 0;
    while ~finished
        data = get(gca, 'UserData');
        if length(data) == 0 % user closed figure
            x=[]; u=[]; close; return;
        end
        % check whether "up" has been called
        if data(1) == 2
            finished = 1;
        else
            pause(0.1);
        end
    end

    % line coordinates from gca.UserData
    [x, u] = interpLinspace(data(2:2:end), data(3:2:end), x0, x1, N);
    
    % replot periodic line
    cla;
    h = line(x, u);
    set(h, 'LineWidth', 3);
    set(h, 'color', 'r');
    
function [x, y] = interpLinspace(x0, y0, xL, xR, N)
    xp = [xL, x0, xR];
    yp = [y0(1), y0, y0(end)];
    
    x = linspace(xL, xR, N);
    y = interp1(xp, yp, x, 'linear');
    
        
function motion(src, data)
    data = get(gca, 'UserData');
    if length(data) == 0 return; end
    if data(1) == 1
        pt = get(gca, 'CurrentPoint');
        x = pt(1,1);
        y = pt(1,2);
        if x <= 0 || x >= 2*pi return; end
        % accept only increasing x
        if length(data) < 3 || x > data(end-1)
            data = [data, x, y];
            set(gca, 'UserData', data);
            if length(data) > 4
                % draw segment of line
                x0 = data(end-3);
                y0 = data(end-2);
                h = line([x0, x], [y0, y]);
                set(h, 'LineWidth', 3);
                set(h, 'color', 'r');
            end
        end
    end
    return

function down(src, data)
    data = get(gca, 'UserData');
    if length(data) == 0 return; end
    data(1) = 1;
    set(gca, 'UserData', data);
    motion;
    return
    
function up(src, data)
    data = get(gca, 'UserData');
    if length(data) == 0 return; end
    data(1) = 2;
    set(gca, 'UserData', data);
    motion;
    return
            