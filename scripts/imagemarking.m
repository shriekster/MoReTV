function IMW=imagemarking(imageFile,seed,payload,showFigures,M)
% imageFile is image or the name of the original image
% seed is the key used to generate random pattern
% payload is an integer on (log2(M)-1)*2 bits
% for 128x128 pattern one can embed a payload on 12 bits
% for 40x40 pattern one can embed a payload on 8 bits
% dimension of the random pattern (MxM)

if(isstr(imageFile))
    IM=imread(imageFile);
else
    IM=imageFile;
end
    
J=rgb2ycbcr(IM);%!!beware
I=rgb2gray(IM);%!!beware

randn('state',seed);
W=randn(M);
Y=watermark(I,W,payload);

J(:,:,1)=Y;%beware!!
IMW=ycbcr2rgb(J);%beware!!must be uncommented


if(showFigures)
    result=sprintf('WM%s',imageFile);
    %write the marked image on the disk
    imwrite(IMW,result);%
    
    % compute MSE and PSNR
    D=double(I)-double(Y);
    D2=D.*D;
    MSE=mean(D2(:));
    PSNR=10*log10(255*255/MSE);
    
    figure('units','normalized','outerposition',[0 0 1 1])
    %vizualizarea imaginii originale
    subplot(1,2,1),imshow(IM),title('Imaginea Originala');
    %vizualizarea imaginii marcate
    subplot(1,2,2),imshow(IMW),title(sprintf('Imaginea Marcata PSNR=%.2f',PSNR));     
end

end