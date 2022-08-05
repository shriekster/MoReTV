 function Y2 = watermark(X,W,PAYLOAD)
% X is the original image
% W is the random pattern 

ROWS = size(X,1);
COLUMNS = size(X,2);

PATTERN_LENGTH = size(W,1);

% Filter to measure local activity 
L = [-1/9 -1/9 -1/9;-1/9 8/9 -1/9;-1/9 -1/9 -1/9];

% Filtering the image by convolution 
LAMBDA=abs(conv2(double(X),L,'same'));

% Duplicate W on the size of the image
WFULL= repmat(W,floor(ROWS/PATTERN_LENGTH),floor(COLUMNS/PATTERN_LENGTH));
WCROPROW = W(1:mod(ROWS,PATTERN_LENGTH),:);
WCROPCOLUMN = W(:,1:mod(COLUMNS,PATTERN_LENGTH));
WROW = repmat(WCROPROW,1,floor(COLUMNS/PATTERN_LENGTH));
WCOLUMN = repmat(WCROPCOLUMN,floor(ROWS/PATTERN_LENGTH),1);
WLACK = W(1:mod(ROWS,PATTERN_LENGTH),1:mod(COLUMNS,PATTERN_LENGTH));
W1= cat(1,WFULL,WROW);
W2= cat(1,WCOLUMN,WLACK);
WEND= cat(2,W1,W2);

WEND=circshift(WEND,[5 5]);

% Computation of the scale factor (image dependent)
% P=LAMBDA.*WEND;
% Sc=255*255*ROWS*COLUMNS/((10^4)*sum(sum(P.*P)));
% Sc=sqrt(Sc);
Sc=0.35;

% mark the original image with the first version of the watermark
Y1 = double(X) + double(Sc)*double(LAMBDA).*WEND;

% Decompose payload in deltaX and deltaY translations
nBits=floor(log2(size(W,1))-1);
DATA = dec2bin(PAYLOAD,2*nBits);
deltaX=bin2dec(DATA(1:nBits));
deltaY=bin2dec(DATA((nBits+1):nBits*2));

WEND=circshift(WEND,[deltaY deltaX]);

% mark image with the second version (circular shift) of the watermark
Y2 = round(double(Y1) + double(Sc)*double(LAMBDA).*WEND);

 end