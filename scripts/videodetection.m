clear all; close all;

videoReader = VideoReader('assets/watermarked/WMAO2.avi'); % octave
%videoReader = vision.VideoFileReader('WMAO.avi'); % uncomment
%videoReader = vision.VideoFileReader('WMAO.mp4');
%videoReader = vision.VideoFileReader('WMAO_gray.mp4', 'VideoOutputDataType', 'uint8','ImageColorSpace','Intensity');%!

nBins=4;
C=zeros(1,nBins*3);
threshold=0.5;%!!beware
%threshold=0.4;
firstFrame=0;

seed=10;
payload=-1;
M=40;

figure('units','normalized','outerposition',[0 0 1 1])
nbScene=0;

% current frame
k=1;
while (videoReader.hasFrame()) % octave
%while ~isDone(videoReader) % uncomment
  %[videoFrame, audioFrame] = step(videoReader); % uncomment
  %[audioFrame, videoFrame] = step(videoReader);%added by daniel
  %videoFrame = step(videoReader);%
  videoFrame = readFrame(videoReader); % octave
  %videoFrame=uint8(255*videoFrame) % uncomment
  

  % the last frame supplied is a null frame
  if(max(videoFrame(:))==0)
    break;
  end  
  
  R=videoFrame(:,:,1);%!!beware
  G=videoFrame(:,:,2);%!!beware
  B=videoFrame(:,:,3);%!!beware
  
  CN(1:nBins)=imhist(R,nBins);%!!beware
  CN(nBins+1:2*nBins)=imhist(G,nBins);%!!beware
  CN(2*nBins+1:3*nBins)=imhist(B,nBins);%!!beware
  
  
  D=double(CN)-double(C);
  C=CN;
  diff=sqrt(D*D')/(10^5);
  
  %added by daniel
  %if (k == 1)%! 
      %CN 
      %sum(sum(R))
      %R(1, 1:16)
      %CN(nBins+1:2*nBins)
      %D
      %diff
  %end
  
  if(diff>threshold)%
    if(k>1)                
        % a scene just has been finished
        if(payload==-1)
            subplot(2,2,1+mod(nbScene,4)),imshow(firstFrame),title(sprintf('Scene Not Marked'));
        else
            subplot(2,2,1+mod(nbScene,4)),imshow(firstFrame),title(sprintf('Scene Marked : Payload %d',payload));    
        end        
        nbScene=nbScene+1;%!! there are 14 'scenes'
    end
    firstFrame=videoFrame;
    payload=-1;
  end
  
  if(payload==-1)
    payload=imagedetection(videoFrame,seed,false,M, k); %% k param is added by me!
  end
  disp(sprintf('Processing Frame %d; Payload: %d',k, payload));%
  k=k+1;
  pause(0.01)
  
  
  %added by daniel
  %{
  payload=imagedetection(videoFrame,seed,false,M);%%
  if (payload > 0)
  [k payload]
  end
  k = k + 1;
  %}
end
  
  

% the last scene has been finished
if(payload==-1)
    subplot(2,2,1+mod(nbScene,4)),imshow(firstFrame),title(sprintf('Scene Not Marked'));
else
    subplot(2,2,1+mod(nbScene,4)),imshow(firstFrame),title(sprintf('Scene Marked : Payload %d',payload));    
end    