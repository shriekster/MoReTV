clear all; 
close all;

videoReader = vision.VideoFileReader('AO.avi');

DIFF=zeros(1,1000);
nBins=4;
C=zeros(1,nBins*3);
threshold=0.5;

% current frame
k=1;
while ~isDone(videoReader)    
  videoFrame = step(videoReader);
  videoFrame=uint8(255*videoFrame);  
  
  disp(sprintf('Processing Frame %d',k));
  
  % the last frame supplied is a null frame
  if(max(videoFrame(:))==0)
    break;
  end  
  imwrite(videoFrame,sprintf('images/%03d.bmp',k)); 
  
  R=videoFrame(:,:,1);
  G=videoFrame(:,:,2);
  B=videoFrame(:,:,3);
  
  CN(1:nBins)=imhist(R,nBins);
  CN(nBins+1:2*nBins)=imhist(G,nBins);
  CN(2*nBins+1:3*nBins)=imhist(B,nBins);
  
  D=double(CN)-double(C);
  C=CN;
  DIFF(k)=sqrt(sum(D*D'))/(10^5);      
  
  if(DIFF(k)>threshold)
    imshow(videoFrame),title(sprintf('Begin Scene ... Frame %d',k));
    pause(0.1);
  end
   
  k=k+1;
end

figure('units','normalized','outerposition',[0 0 1 1])
plot(DIFF),title('Scene Detection Using Color Histogram Difference');