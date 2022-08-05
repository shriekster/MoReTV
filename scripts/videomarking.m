clear all; 
close all;

videoReader = vision.VideoFileReader('AO.avi');
%videoReader = vision.VideoFileReader('hale_bopp_2.mpg');
videoReader.AudioOutputPort=true;

attack=false;
%attack=true;

videoWriter = vision.VideoFileWriter('WMAO.avi','AudioInputPort',1);%
%videoWriter = vision.VideoFileWriter('WMAO.mp4','FileFormat','MPEG4');

videoWriter.AudioCompressor='None (uncompressed)';
% You can use tab completion to query valid Compressor options for your computer 
% by typing videoWriter.AudioCompressor = ' and then pressing the tab key ...

if(attack)
    % compressed video MPEG-4
    % videoWriter.VideoCompressor='Xvid MPEG-4 Codec';
    % videoWriter.VideoCompressor='MPEG-4';
    % if MPEG-4 not available try the classic MJPEG
    videoWriter.VideoCompressor='MJPEG Compressor';
    %change the frame rate
    videoWriter.FrameRate=25;    
else
    % uncompressed video
    videoWriter.FrameRate=25; 
end

% dimension MxM of the random pattern
M=40;
% payload should be an integer on 8 bits
seed=10;
 
% current frame
k=1;
while ~isDone(videoReader)    
  [videoFrame,audioFrame] = step(videoReader);    
  videoFrame=uint8(255*videoFrame);%beware!!must be uncommented

   % the last frame supplied is a null frame
  if(max(videoFrame(:))==0)
    break;
  end 
  
  if(rem(k-1,10)==0)
    disp(sprintf('Processing Frame %d',k));
  end
  
  % mark some scenes
  if((k>=242 && k<=335))
      % Ferrer scenes
      payload=100;  
      videoFrame=imagemarking(videoFrame,seed,payload,false,M);
  else
      if(k>=410 && k<=452)
         % Dimitrov scenes 
         payload=101;
         videoFrame=imagemarking(videoFrame,seed,payload,false,M);
      else
         if(k>=596 && k<=751)
            % Nadal scenes
            payload=102;
            videoFrame=imagemarking(videoFrame,seed,payload,false,M);
         end
      end
  end
  %videoFrame=uint8(videoFrame);
  
  if(attack)
     % add some Gaussian noise to the frame 
    videoFrame=uint8(videoFrame);
    videoFrame=imnoise(videoFrame,'gaussian',0,0.0002);
    
    dx= randi([5 10]);
    dy= randi([5 10]);
    % simulate a camera translation
    shiftFrame=zeros(size(videoFrame,1),size(videoFrame,2),3);
    shiftFrame(dx+1:size(videoFrame,1),dy+1:size(videoFrame,2),:)=videoFrame(1:size(videoFrame,1)-dx,1:size(videoFrame,2)-dy,:);
    videoFrame=uint8(shiftFrame);
  end
  
  step(videoWriter,videoFrame,audioFrame);%  
  %step(videoWriter,videoFrame);
  k=k+1;
end

release(videoReader);
release(videoWriter);