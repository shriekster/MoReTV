function PAYLOAD = detect(IM,W,showFigures, k) % k added
% IM is the marked image
% W is the random pattern 
% payload is an integer on (log2(M)-1)*2 bits
% M is the dimension of the random pattern W 
M=size(W,1);
ROWS = size(IM,1);
COLUMNS = size(IM,2);

A = 1/4 * [1 -2 1;-2 4 -2;1 -2 1];
% preprocessing : filter the marked image with A
IM = conv2(double(IM),A,'same');
%imshow(IM);%
%pause;%

C=floor(COLUMNS/M);
R=floor(ROWS/M);

% preparing the matrices for the operation in the Fourier domain
rep=[];
for ii=1:M
    for jj=1:M
        rep(ii,jj)=0;
        for j1=0:R-1
            for j2=0:C-1
                rep(ii,jj)=rep(ii,jj)+IM(ii+j1*M,jj+j2*M);
            end
        end
    end
end
%rep(1,:)
%x=phaseOnly(fft2(rep)).*phaseOnly(conj(fft2(W)));x(1,:)
R=ifft2(phaseOnly(fft2(rep)).*phaseOnly(conj(fft2(W))));
R=abs(R); %cv.magnitude%
%R(1,:)
%R(6,:)%
%R(1,10)%
%sum(sum(R))%
re = real(sum(sum(R)));%
im = imag(sum(sum(R)));%

if(showFigures)
    colormap('Winter');
    surf(R);
    xlabel('Horizontal Shift');
    ylabel('Vertical Shift Shift');
    zlabel('Correlation Value');
end

PAYLOAD=-1;

%detecting the two peaks
nBits=floor(log2(M)-1);
threshold=0.2;
[X Y] = find(R>threshold);

if(size(X,1)==2)
    deltaX=X(2)-X(1);
    deltaY=Y(2)-Y(1);
    if abs(deltaX)<M/2 && abs(deltaY)<M/2 
        PAYLOAD = strcat(dec2bin(abs(deltaY),nBits),dec2bin(abs(deltaX),nBits));
        PAYLOAD = bin2dec(PAYLOAD);
    end
end

end

function Y = phaseOnly(X)
N=size(X,1);

    for ii=1:N
        for jj=1:N
            if X(ii,jj)~= 0
                Y(ii,jj)=X(ii,jj)/abs(X(ii,jj));
            else
                Y(ii,jj)=1;
            end
        end
    end
end