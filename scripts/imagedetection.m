function payload=imagedetection(imageFile,seed,showFigures,M, k) % k added! 
% imageFile is the name of the marked image
% seed is the key used to generate random pattern
% dimension of the random pattern (MxM)

% regenerate the same pattern
randn('state',seed);
W=randn(M);
%if(isstr(imageFile)) % uncomment
if(ischar(imageFile)) % added
    I=imread(imageFile);
else
    I=imageFile;
end
I= rgb2gray(I);%!!beware
%sum(sum(I))
%pause

payload = detect(I,W,showFigures, k); % k added

end