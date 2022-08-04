const cv = require('@u4/opencv4nodejs');
const { complex } = require('mathjs');
const math = require('mathjs');
const path = require('path');


process.on('message', (m) => {

    //console.log('CHILD got message', m);

    const videoPath = path.join(__dirname, '../assets/watermarked/WMAO.avi');

    const video = new cv.VideoCapture(videoPath)

    const frames = video.get(cv.CAP_PROP_FRAME_COUNT);

    let i = 1;

    while (i <= frames) {

      let frame = video.read();

      if (!frame.empty) {

        processFrame(frame);

      } else {

        break;

      }

      i++;


    }

    console.log(frames, 'frames')

    video.release();

    process.send('message from CHILD');

});

var port = undefined;

var frames = 0;
var frameBuffer = [];

var currentFrame = 0;

var timer = null;

var appending = false;
var decoding = false;

var decoder = undefined;

//function matFromArray(rows,cols,type,array){var mat = new cv.Mat(rows,cols,type);switch(type){case cv.CV_8U:case cv.CV_8UC1:case cv.CV_8UC2:case cv.CV_8UC3:case cv.CV_8UC4:{mat.data.set(array);break}case cv.CV_8S:case cv.CV_8SC1:case cv.CV_8SC2:case cv.CV_8SC3:case cv.CV_8SC4:{mat.data8S.set(array);break}case cv.CV_16U:case cv.CV_16UC1:case cv.CV_16UC2:case cv.CV_16UC3:case cv.CV_16UC4:{mat.data16U.set(array);break}case cv.CV_16S:case cv.CV_16SC1:case cv.CV_16SC2:case cv.CV_16SC3:case cv.CV_16SC4:{mat.data16S.set(array);break}case cv.CV_32S:case cv.CV_32SC1:case cv.CV_32SC2:case cv.CV_32SC3:case cv.CV_32SC4:{mat.data32S.set(array);break}case cv.CV_32F:case cv.CV_32FC1:case cv.CV_32FC2:case cv.CV_32FC3:case cv.CV_32FC4:{mat.data32F.set(array);break}case cv.CV_64F:case cv.CV_64FC1:case cv.CV_64FC2:case cv.CV_64FC3:case cv.CV_64FC4:{mat.data64F.set(array);break}default:{throw new Error("Type is unsupported")}}return mat};
function matFromArray(rows,cols,type,array) {
  
  const buffer = Buffer.from(array);

  var mat = new cv.Mat(buffer, rows,cols,type);

  return mat;

}

function fft2(array, rows = 40, cols = 40) {

  let real = undefined;

  real = array instanceof cv.Mat  ?
    array                         :
    //cv.matFromArray(rows, cols, cv.CV_64F, array); // this was commented! (matFromArray)
    matFromArray(rows, cols, cv.CV_64F, array);

  //let planes = new cv.MatVector(); // this was commented! (matFromArray)

  //let complex = new cv.Mat();//delete // this was commented! (matFromArray)
  //let imaginary = new cv.Mat.zeros(rows, cols, cv.CV_64F);//delete // this was commented! (matFromArray)
  let imaginary = new cv.Mat(rows, cols, cv.CV_64F, 0); 
  //planes.push_back(real); // real plane   // this was commented! (matFromArray)
  //planes.push_back(imaginary);// imaginary plane    // this was commented! (matFromArray)
  //cv.merge(planes, complex);    // this was commented! (matFromArray)
  let complex = matFromArray(rows, cols, cv.CV_64F, [real.getDataAsArray(), imaginary.getDataAsArray()])
  
  // actual Fourier transform 
  //cv.dft(complex, complex, cv.DFT_COMPLEX_OUTPUT); // this was commented! (matFromArray)
  complex = complex.dft(cv.DFT_COMPLEX_OUTPUT, 0) // this was added (matFromArray)
  
  // split the real and imaginary planes 
  //cv.split(complex, planes);
  let planes = complex.splitChannels(); //??????????????????????????????????????????
  
  //let re = planes.get(0); // this was commented! (matFromArray)
  let re = planes[0];
  //let im = planes.get(1); // this was commented! (matFromArray)
  let im = planes[1];

  for (let i = 0; i < rows; i++) {

    for (let j = 0; j < cols; j++) {

      //re.doublePtr(i, j)[0] = re.doubleAt(i, j).toFixed(4); // this was commented! (matFromArray)
      //im.doublePtr(i, j)[0] = im.doubleAt(i, j).toFixed(4); // this was commented! (matFromArray)

      //re.set(i, j, re.at(i, j).toFixed(4)) // this was commented! (matFromArray) and must be uncommented
      //im.set(i, j, im.at(i, j).toFixed(4)) // this was commented! (matFromArray) and must be uncommented

    }

  }

  //real.delete(); // this was commented! (matFromArray)
  //complex.delete(); // this was commented! (matFromArray)
  //imaginary.delete(); // this was commented! (matFromArray)

  //return planes; // this was commented! (matFromArray)
  return [re, im];
}

function ifft2(array, rows = 40, cols = 40) {
  //let complex = undefined; // this was commented! (matFromArray)
  let ret;

  let complex = array instanceof cv.Mat ? array : matFromArray(rows, cols, cv.CV_64F, array); // new, uncertain (matFromArray)

  //complex = array instanceof cv.MatVector ? // this was commented! (matFromArray)
  //  new cv.Mat()                          : // this was commented! (matFromArray)
  //  null;                                   // this was commented! (matFromArray)

  if (complex) {

    //cv.merge(array, complex); // this was commented! (matFromArray)
    
    // This is how MATLAB does ifft2, pay great attention
    //cv.dft(complex, complex, cv.DFT_INVERSE | cv.DFT_SCALE); // this was commented! (matFromArray)
    complex = complex.dft(cv.cv.DFT_INVERSE | cv.DFT_SCALE, 0); // this was added (matFromArray)

    // split the real and imaginary planes //
    //cv.split(complex, array); // this was commented! (matFromArray)
    let planes = complex.splitChannels();

    //let re = array.get(0); // this was commented! (matFromArray)
    let re = planes[0];
    //let im = array.get(1); // this was commented! (matFromArray)
    let im = planes[1];
  
    for (let i = 0; i < rows; i++) {
  
      for (let j = 0; j < cols; j++) {
  
        //re.doublePtr(i, j)[0] = re.doubleAt(i, j).toFixed(4); // this was commented! (matFromArray)
        //im.doublePtr(i, j)[0] = im.doubleAt(i, j).toFixed(4); // this was commented! (matFromArray)
        re?.set(i, j, Number(re.at(i, j)).toFixed(4) | 0) // this was commented! (matFromArray) and must be uncommented
        im?.set(i, j, Number(im.at(i, j)).toFixed(4) | 0) // this was commented! (matFromArray) and must be uncommented
  
      }
  
    }

    //complex.delete(); // this was commented! (matFromArray)
    ret = matFromArray(rows, cols, cv.CV_64F, [re?.getDataAsArray(), im?.getDataAsArray()]);

  }

  //return array; // this was commented! (matFromArray)
  return ret;
}

function phaseOnly(cv_MatVector) {
  //let phased = new cv.MatVector();// this was commented! (matFromArray)
  let phased = [];
  let realPlane = cv_MatVector[0].copy();
  let imaginaryPlane = cv_MatVector[1].copy();
  //let realPlane = cv_MatVector.get(0).clone();    // this was commented! (matFromArray)
  //let imaginaryPlane = cv_MatVector.get(1).clone(); // this was commented! (matFromArray)

  let n = realPlane.rows;

  for (let ii = 0; ii < n; ii++) {
    for (let jj = 0; jj < n; jj++) {
      //if (realPlane.doubleAt(ii, jj) !== 0 ||           // this was commented! (matFromArray)
      //    imaginaryPlane.doubleAt(ii, jj) !== 0) {      // this was commented! (matFromArray)
      if(realPlane.at(ii, jj) !== 0 || imaginaryPlane.at(ii, jj) !== 0) {

            //let re = realPlane.doubleAt(ii, jj).toFixed(4); // this was commented! (matFromArray)
            
            let re = Number(realPlane.at(ii, jj)).toFixed(4);
            //let im = imaginaryPlane.doubleAt(ii, jj).toFixed(4);  // this was commented! (matFromArray)
            let im = Number(imaginaryPlane.at(ii, jj)).toFixed(4);

            if (isNaN(re)) re = 0;
            if (isNaN(im)) im = 0;

            
            let num = math.complex(
              re, //!!
              im
            ); //!!

            let den =
            math.complex(
              math.abs(
                math.complex(
                  re, //!! 
                  im))); //!!

            let result = math.divide(num, den);

            let rre = Number(result.re).toFixed(4) | 0;
            let ire = Number(result.im).toFixed(4) | 0;

            //realPlane.doublePtr(ii, jj)[0] = rre; //!! rre // this was commented! (matFromArray)
            realPlane?.set(ii, jj, rre);
            
            //imaginaryPlane.doublePtr(ii, jj)[0] = ire; //!! // this was commented (matFromArray)
            imaginaryPlane?.set(ii, jj, ire);

      } else {
        //realPlane.doublePtr(ii, jj)[0] = 1; // this was commented! (matFromArray)
        realPlane.set(ii, jj, 1)
        //imaginaryPlane.doublePtr(ii, jj)[0] = 0; // this was commented! (matFromArray)
        imaginaryPlane.set(ii, jj, 0);
      }
    }
  }

  //phased.push_back(realPlane);// this was commented! (matFromArray)
  phased.push(realPlane);
  //phased.push_back(imaginaryPlane);// this was commented! (matFromArray)
  phased.push(imaginaryPlane);

  return phased;
}

function conj(cv_MatVector) {
  //let imaginaryPlane = cv_MatVector.get(1); // this was commented! (matFromArray)
  let imaginaryPlane = cv_MatVector[1];
  for (let r = 0; r < imaginaryPlane.rows; r++) {
    for (let c = 0; c < imaginaryPlane.cols; c++) {
      //imaginaryPlane.doublePtr(r, c)[0] *= (-1); // this was commented! (matFromArray)
      imaginaryPlane.set(r, c, imaginaryPlane.at(r, c) * (-1));
    }
  }
  return cv_MatVector;
}

function dotMultiply(cv_MatVector1, cv_MatVector2) {
  //if (cv_MatVector1.get(0).rows !== cv_MatVector2.get(0).rows || // this was commented! (matFromArray)
  //    cv_MatVector1.get(0).cols !== cv_MatVector2.get(0).cols)  // this was commented! (matFromArray)
  //  return null;                                                // this was commented! (matFromArray)
  if (cv_MatVector1[0]?.rows !== cv_MatVector2[0]?.rows ||
      cv_MatVector1[0]?.cols !== cv_MatVector2[0]?.cols)
      return null;

  //let result = new cv.MatVector();  // this was commented! (matFromArray)
  let result = [];
  //let rp1 = cv_MatVector1.get(0).clone(); // this was commented! (matFromArray)
  //let ip1 = cv_MatVector1.get(1).clone(); // this was commented! (matFromArray)
  //let rp2 = cv_MatVector2.get(0); // this was commented! (matFromArray)
  //let ip2 = cv_MatVector2.get(1); // this was commented! (matFromArray)
  let rp1 = cv_MatVector1[0].copy();
  let ip1 = cv_MatVector1[1].copy();
  let rp2 = cv_MatVector2[0].copy();
  let ip2 = cv_MatVector2[1].copy();
  
  if (currentFrame >= 155) {
    //console.log(rp1.data64F)
    //console.log(currentFrame, rp1.doubleAt(20, 0))
  }

  for (let r = 0; r < rp1.rows; r++) {
    for (let c = 0; c < rp1.cols; c++) {
      
      //let r1 = rp1.doubleAt(r, c) || 0; // this was commented! (matFromArray)
      //let i1 = ip1.doubleAt(r, c) || 0; // this was commented! (matFromArray)
      //let r2 = rp2.doubleAt(r, c) || 0; // this was commented! (matFromArray)
      //let i2 = ip2.doubleAt(r, c) || 0; // this was commented! (matFromArray)
      let r1 = rp1.at(r, c) || 0;
      let i1 = ip1.at(r, c) || 0;
      let r2 = rp2.at(r, c) || 0;
      let i2 = ip2.at(r, c) || 0;

      if (currentFrame >= 155) {
        //console.log(r1, i1, r2, i2)
      }

      let complex1 = math.complex(r1, i1);

      let complex2 = math.complex(r2, i2);

      let complexProduct = math.multiply(complex1, complex2);

      //rp1.doublePtr(r, c)[0] = complexProduct.re.toFixed(4); // this was commented! (matFromArray)
      rp1.set(r, c, complexProduct.re.toFixed(4) | 0);
      //ip1.doublePtr(r, c)[0] = complexProduct.im.toFixed(4); // this was commented! (matFromArray)
      ip1.set(r, c, complexProduct.im.toFixed(4) | 0);
    }
  }

  //result.push_back(rp1); // this was commented! (matFromArray)
  //result.push_back(ip1); // this was commented! (matFromArray)
  result.push(rp1);
  result.push(rp2);

  return result;
}

function abs(complexArray) {

  if (!complexArray) {
    return null;
  }
  
  //let real = complexArray.get(0).data64F;//.map(a => a); // this was commented! (matFromArray)
  //let imaginary = complexArray.get(1).data64F;//.map(a => a); // this was commented! (matFromArray)
  let [real, imaginary] = complexArray.splitChannels();
  real = real?.getDataAsArray();
  imaginary = imaginary?.getDataAsArray();

  let length = real.length;

  let result = [];

  for (let i = 0; i < length; i++) {

    let res = math.abs(
      math.complex(
        Number(real?.[i]).toFixed(4) | 0, 
        Number(imaginary?.[i]).toFixed(4) | 0)
    );

    result.push(parseFloat(Number(res).toFixed(4)));

  }

  return result;
}

function find (array, value, rows = 40, cols = 40) {
  let x = [];
  let y = [];

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (array[i * rows + j] > value) {
        x.push(i);//i
        y.push(j);//j
      }
    }
  }

  return { x, y }; //x, y
}

function dec2bin(number, minBits) {
  let result = (number >>> 0).toString(2); // number.toString(2)
  if (result.length < minBits) {
    result = result.padStart(minBits, '0');
  }
  return result;
}

function bin2dec(binaryString) {
  return parseInt((binaryString + '').replace(/[^01]/gi, ''), 2);
}

/* M is 40, the dimension of the random pattern, i.e. M x M */
const M = 40;

/* W is the random pattern */
let W = 
[2.0211,0.5018,-1.9983,0.2723,0.3368,0.1378,-1.6106,-1.0075,
  -0.5144,-2.0889,1.0461,0.2153,-0.1624,-0.1758,1.1022,0.5150,
  0.1770,0.2505,1.5957,0.7204,0.9246,1.5985,-0.7592,0.1563,-0.6127,
  1.2769,1.4401,0.9483,-0.6553,0.6555,0.5042,1.1161,0.7997,-0.2400,
  -0.2468,-1.7171,-0.2591,-2.8881,0.7486,0.1583,2.2664,0.8536,0.2489,
  -0.3388,-1.8265,1.2964,-0.1060,0.2325,-1.5791,-0.6983,1.6993,1.2974,
  -0.0565,-0.0349,-0.4341,-0.7800,1.7504,1.1294,-0.9810,2.1674,1.2917,
  -0.8704,1.3713,-1.9612,-0.1115,-0.7416,-2.1373,-1.7813,-0.2393,0.3865,
  -0.3882,-1.5516,0.9784,-0.0081,-0.5400,2.0317,0.9798,-0.1432,0.7242,
  1.2682,0.6903,-1.7560,0.3210,0.8992,-1.2081,-0.7309,-1.1523,-0.1015,
  -4.0341,0.9498,-0.5712,1.5063,-1.5377,-1.1560,-0.6875,-0.3609,-3.1608,
  -0.7484,-1.2097,0.0181,2.3393,1.3657,1.0145,-0.4558,-1.4736,-0.5326,
  -0.2228,-1.6704,0.6773,-0.9653,0.3129,1.3071,0.5270,1.3223,0.8837,
  1.5752,1.5463,0.3485,1.0323,0.9789,0.7037,-0.2327,-1.1178,0.3645,0.6191,
  -1.6313,0.0316,2.5215,-0.7120,-0.0572,-0.0438,-0.4335,0.0269,2.1549,0.2073,
  0.8005,-1.8403,-1.8438,-0.5719,0.8710,-1.4065,-0.1891,-1.5875,1.4439,-1.4930,
  -0.8540,3.3417,1.3026,1.2167,1.3044,0.2381,1.3117,2.1234,1.4459,0.4245,-1.5142,
  1.3858,0.6952,0.1820,-0.8612,0.1738,0.6170,0.2339,-1.8855,0.8520,0.5217,-1.0810,
  0.0800,-1.8095,0.8082,0.1628,2.2230,1.9686,-0.5698,-0.5748,0.0395,0.7742,0.8169,
  -0.0229,-0.3462,0.1906,0.5323,0.7484,0.1495,0.9008,-0.5658,0.2943,0.6540,-0.2600,
  -0.4667,0.1106,-0.7642,-0.1824,0.8960,-0.1834,-2.1588,0.0699,-0.0804,-0.0990,0.1369,
  2.2352,0.7690,1.6765,0.0581,-2.4032,0.0821,0.6313,-0.9350,0.4404,-0.8574,-1.2543,
  0.5067,-0.3169,0.1263,2.5355,0.6236,0.7904,-0.3012,2.1320,-0.0399,-0.0123,-0.8283,
  2.2573,0.6521,-0.7713,0.0159,0.3727,-2.3887,1.2362,0.1708,0.4444,0.2558,-0.2410,
  1.3628,1.2226,0.5057,1.6578,-1.2868,-0.4760,0.8111,1.0572,0.5980,-1.5289,-0.5721,
  1.0543,-1.7966,-0.1409,1.6421,-0.8713,-0.2342,-0.9455,-0.6573,0.5632,1.7570,-1.9810,
  1.7709,-0.8847,-1.6731,-0.8016,0.2276,-0.3521,-1.9081,-0.1011,-0.1792,-0.8473,-1.3107,
  1.6724,-0.3186,-1.6814,-0.2760,1.9600,0.1064,0.4535,-0.1512,0.9114,0.9971,-0.4393,
  -0.6188,-0.3648,1.8963,-0.3777,1.0937,-0.2678,0.2669,0.9831,-0.1987,1.1329,-0.1436,
  0.6589,0.0256,-0.3957,1.2932,-1.2804,1.0098,1.5316,0.2073,-0.4547,-0.3762,-0.0704,
  1.9113,0.6034,-0.1208,-0.6368,-0.3881,0.3308,-1.7661,-0.1792,-0.0456,-1.7433,1.4192,
  -0.2846,0.0838,-0.2417,-0.9515,0.8950,0.4647,-1.0623,1.7966,-1.0324,-1.0004,-1.7557,
  -1.2012,1.1142,0.5158,-1.1198,-1.4347,0.0648,0.5067,0.2607,-0.3515,-1.0674,0.0611,
  0.9891,-0.5812,-1.1467,1.8242,-1.1066,2.3115,0.2873,-0.4229,0.4727,0.1834,-2.4965,
  -0.2080,-1.3474,0.9617,0.3722,-2.3449,0.4910,-0.3210,1.8689,-0.0512,0.5884,1.3658,
  -0.7711,0.0298,2.3115,-0.3461,1.0402,-0.1871,-0.1752,0.1572,1.5274,-0.6710,-0.7540,
  -0.3596,-0.9899,-1.8438,1.0954,0.8229,0.5827,-0.8577,0.5888,-2.1219,1.9746,0.6419,
  -0.9776,1.4480,-0.3118,1.3812,0.7545,-0.3131,0.2086,0.8292,0.8498,-0.7224,-0.6204,
  -1.6104,-0.8892,-0.2761,-0.8286,0.6069,1.2374,1.0465,-0.7334,0.0382,-1.2147,-1.0619,
  2.2000,0.0364,0.8178,0.7110,0.9667,-0.4409,0.5349,-0.0752,0.3838,-0.3352,0.9829,
  -0.0739,-0.4585,0.0841,0.0191,-0.8353,-1.3749,0.3201,-1.2230,1.9741,-0.4041,1.2710,
  -0.5252,-0.5615,0.1972,0.1292,0.3640,-0.2525,-0.1798,-2.3638,0.7412,0.1299,1.7127,
  -0.0542,-0.7320,0.4734,-0.6967,-0.0375,-0.2116,-0.9375,0.0570,1.3480,0.8999,-0.5289,
  -2.4181,0.4147,-0.4854,-0.3061,1.4429,-0.2320,-0.4638,1.1448,-1.3122,-0.3307,1.0897,
  -0.1795,-1.7955,0.8761,0.2931,2.0349,0.4509,0.1393,-1.0878,0.5625,-0.3156,-0.5141,
  -0.1921,-0.9249,1.9995,-0.1105,0.8865,-0.7710,-2.1139,-1.7922,-2.1657,1.5024,0.5662,
  0.5329,-0.6992,1.4611,0.8424,-0.2540,0.0509,1.0046,0.7087,-1.6836,-0.0198,-0.0854,
  -0.8708,-0.5588,-0.1188,0.3869,0.4047,0.7451,0.9338,-0.1074,-3.1375,-0.0804,-2.0684,
  0.0080,-0.3345,0.8275,-0.4888,-0.9009,0.4886,-1.4416,0.6713,0.2515,-0.8937,1.2637,
  -0.4163,-0.3502,-1.5787,-0.8389,1.2111,-0.9347,1.0414,1.0965,1.7544,0.1421,0.1668,
  2.7685,-0.3857,-0.9299,0.3029,-2.0758,-0.8266,-1.0912,-1.3353,2.6118,0.8573,-0.4972,
  1.9619,0.4968,-0.8716,1.0555,0.0599,0.7958,-1.0009,0.6412,0.2060,-2.8716,1.1695,0.5474,
  -0.7015,-1.8406,-0.3661,-0.4807,0.9582,0.4715,-0.1504,0.5367,-1.6803,-0.6531,-1.4733,
  0.3410,-0.3648,2.3081,-0.3034,0.6522,1.4522,0.2434,-0.4114,-1.0330,0.1187,1.1601,0.5251,
  0.8947,-0.9491,0.6543,-0.1585,1.7485,-2.3924,0.7864,-1.4649,0.3973,-2.1587,-0.0786,
  -1.8716,-0.2816,1.3584,0.5160,0.8078,1.3714,2.7613,0.9549,0.5502,0.6822,-0.1838,-0.1586,
  -0.1475,1.9046,-1.6801,-1.0174,1.2562,-0.0873,0.1702,-0.4423,1.6937,-0.0718,2.2107,0.7909,
  1.9268,1.2949,-1.3738,-0.0578,0.9590,0.8072,0.2357,-0.8428,-0.0180,1.5205,1.7097,0.4393,
  -1.6251,0.3216,-1.3790,-0.6811,-0.3004,-1.3494,-1.2332,0.9205,-1.4991,-1.4195,1.2828,0.2195,
  -1.9409,-0.7975,-0.6417,-0.4713,-1.4806,0.2375,1.0899,-0.2663,1.0790,-0.7165,-0.1348,-1.4634,
  0.1335,0.6239,-1.5252,0.1423,0.3482,0.5666,-2.4088,0.6136,-0.5236,0.8318,0.1481,-0.1029,1.6342,
  0.5266,0.2449,-0.7195,-2.2949,0.4009,-1.2388,-0.2358,-2.6022,0.8983,-2.2012,-2.1747,-0.6935,0.7617,
  0.5428,0.4400,-0.8707,-0.6387,-1.7638,0.8815,-0.2396,-1.1159,-0.2169,-0.5923,0.6514,-0.3102,-1.0190,
  0.8689,-0.1681,-2.1663,0.0943,2.0598,0.4318,1.2901,0.0433,1.1648,-0.6071,-0.0923,0.9321,0.4461,0.6672,
  0.4945,-0.2757,1.0882,0.2670,-0.0571,0.8604,0.1923,-1.1660,1.0359,-1.2705,-1.3540,-0.4234,-1.6914,-0.3673,
  0.1457,1.8173,-0.4466,0.7242,1.1913,0.6992,-0.1144,-0.5635,-1.7162,-2.1148,-0.6904,-1.5475,-1.1017,0.0772,
  -0.2513,-2.0594,2.1818,-0.5980,-0.1814,-0.7319,-1.1684,-1.0062,2.4111,1.0046,0.9102,-0.7816,-0.6989,1.0771,
  0.2265,-1.0114,0.0693,-0.8358,3.4681,1.1465,0.5018,-0.7667,-0.2063,0.9578,0.7716,-1.0668,-0.3980,1.2897,
  1.0505,-0.4855,1.2391,-0.8351,1.2377,0.0015,1.3121,-0.2959,-0.0111,-0.2309,-0.0817,-1.0654,-1.4085,-0.5721,
  -0.3918,1.2999,0.1455,-0.9153,-0.1600,1.0549,-0.7765,-0.6024,0.1744,-0.4730,-0.4203,-0.0690,0.3500,0.8532,
  -1.9876,0.7441,-0.3034,0.4622,0.7287,0.0092,-1.3769,1.7666,-0.1215,0.9555,0.7345,0.5665,1.9333,-1.3568,
  -1.1539,-0.2939,-1.4847,-1.6204,0.1392,-0.3834,0.0524,-2.4078,-0.6527,-0.0710,0.0596,-1.0030,0.1448,-0.6325,
  0.1808,2.0819,0.2599,0.2548,0.8061,1.3750,0.3573,-1.6099,-0.4868,0.9807,0.6209,-0.5866,0.6032,-2.2220,
  -0.7806,1.3990,-0.2720,-0.9098,-0.1956,1.1833,-1.9641,-0.4088,-1.7336,-0.1773,2.7518,-0.2113,0.1897,0.5377,
  -0.2560,1.6272,-0.6056,-1.9224,0.0013,-0.7121,-2.2508,-1.1582,-0.0309,0.9751,0.0168,-0.0371,-0.1828,-0.1521,
  1.0560,-0.6758,1.1366,1.1874,-1.4342,0.8139,-0.7908,0.4637,-0.0766,-0.9719,0.4940,-0.1464,0.6846,-1.0164,
  -0.7670,-1.1601,-1.9200,-0.4619,0.2068,-1.0110,0.0876,1.6656,1.0697,-0.7749,-1.3828,-0.4068,-0.7388,-2.1489,
  -0.0517,-1.8742,0.9446,-0.5983,-0.1849,1.2811,-0.1324,-1.1601,-1.0679,-0.6863,1.2721,-1.9147,-1.2779,
  -0.9899,1.0667,1.5127,0.0666,0.5578,-0.9488,-0.9236,0.5230,0.2264,1.1340,-1.3889,0.1578,0.4030,2.9889,
  1.0385,2.1398,1.8558,1.8444,-0.9731,-0.8367,1.5678,-0.5559,-1.4322,0.0939,1.0952,-0.1090,-0.7214,0.2617,
  0.3851,0.4325,0.5633,-0.7195,0.7477,-0.5464,-0.9244,-0.8541,0.0050,-1.6017,-0.5586,-2.2216,-0.0455,
  -2.1338,-1.0277,-0.9645,-0.1960,-0.6573,-0.1796,-0.6401,0.9500,0.8011,-0.1623,-0.4633,0.5514,0.0272,
  1.2481,-1.0688,-0.2715,-0.2626,0.7047,-1.6155,0.2293,0.9471,-1.1211,-0.7304,0.9689,-0.6373,0.0787,
  1.3644,0.7326,0.3769,0.4070,-0.2337,0.3614,0.1905,0.8077,-0.0953,-0.1895,-0.9703,-0.0860,-0.8161,
  -0.2503,0.6521,0.4970,2.1791,1.1647,0.6015,-0.1974,-0.3619,0.2087,-0.3131,0.1041,2.1756,-0.2279,
  0.5127,-1.6989,1.1626,1.7845,-0.7780,1.4467,2.1055,-0.0092,1.7910,-0.3365,0.5907,-0.7037,0.7632,
  -0.2125,-0.3646,-0.2163,-0.4842,2.5591,-0.7157,-1.4726,1.3937,-0.5148,0.6196,-2.2594,0.5315,0.5218,
  0.0214,0.7244,1.5419,0.5879,-0.0830,-1.8409,-0.3593,0.5800,0.0681,0.4012,0.1809,0.6849,0.1520,-1.6759,
  0.5069,-0.3871,-0.1904,1.3473,0.1604,-0.6415,0.2211,-0.3433,-1.6929,-1.0609,-2.0438,0.7075,1.3930,-0.1408,
  -2.3294,-0.3889,-1.2880,-0.9249,-0.0232,0.2698,-0.2378,-0.6299,-0.5044,0.7340,1.4566,-0.5135,0.4814,1.6847,
  -3.6758,-0.3107,0.4215,-0.2290,-0.1886,-0.3514,0.2723,-0.6303,-0.8466,-2.2134,0.7881,-0.1610,-2.1110,0.6444,
  0.0427,0.4914,0.3784,0.0851,1.1276,0.0004,0.8118,-1.1530,0.9864,0.2712,-0.2328,0.4885,-2.6754,0.5511,-1.4685,
  -0.4019,-1.0756,0.8724,-0.0458,-0.3856,0.2131,0.6181,0.2638,0.0879,-0.7437,-0.2189,-1.0736,-0.0657,0.0758,
  0.4349,-1.4969,1.8161,-0.1856,-1.6347,-0.9528,-1.0370,1.0378,1.4111,-0.2523,1.1223,-0.1808,-0.1407,2.2995,
  1.2221,-0.3035,1.2170,1.2196,-1.7522,-0.7307,-0.7408,1.4720,0.1021,1.7708,-1.3520,0.2483,-1.5739,0.5927,
  0.2677,-0.9801,1.0752,0.6446,-0.8691,0.3451,-1.0070,-0.4985,-1.1508,0.2441,0.6928,0.0962,-0.1814,1.7480,
  -0.3832,0.5825,-0.7025,-1.4303,-0.7802,-0.6436,-0.5566,0.5506,-0.6683,-1.5713,0.2109,-0.2956,-2.1927,
  -1.7674,-1.1676,-0.2511,-0.6285,1.1141,-0.2613,-0.0442,-0.6757,0.8907,-0.3552,-0.3026,0.2521,0.2089,
  -0.7031,-0.0604,0.2154,-0.8697,-0.9924,-0.5792,0.4594,0.9757,-0.6547,-0.5038,-0.3065,0.3700,-1.0314,
  1.6517,0.0136,2.0466,0.7736,1.0502,-2.0171,-2.2157,1.3891,0.5011,-0.7559,-0.4423,0.5373,0.4652,
  -0.8701,-0.6975,0.9656,-0.5513,1.1559,0.5324,-1.3875,-1.4698,0.2842,1.1389,-2.5385,-0.6662,1.8272,
  -1.2620,-0.4627,0.3337,0.3231,-0.1838,-0.3671,-2.0903,-1.6260,-1.0719,-2.3093,-1.4983,0.5394,1.4106,
  0.2051,0.2081,-0.4459,1.0868,1.0099,1.0881,0.7952,2.6682,-1.8103,0.2607,-0.2156,0.2903,1.0671,
  -1.9529,1.0375,-0.7274,2.5705,-1.4494,0.9528,-0.3347,-1.0035,-0.8742,-0.1586,0.1129,1.8885,-1.0697,
  1.0055,-0.0257,-0.0104,-0.6061,-0.6267,-0.3861,-0.6518,1.7678,-0.1458,0.7245,1.4202,0.2861,-0.1393,
  2.0054,-0.0257,-2.2275,0.0648,0.0849,-0.1491,-0.1011,0.2612,-0.0117,-0.4782,1.2320,0.9165,0.5890,
  -0.8615,0.6835,-0.5800,-0.4748,0.7927,0.3448,1.8371,-1.3566,0.2356,-1.5783,0.4110,1.3809,-0.6871,
  -0.1132,0.7166,0.2085,0.7799,-0.9186,0.1176,2.0189,-0.4846,0.4419,-3.0388,1.0328,-0.7114,-0.0483,
  -0.6446,1.9414,1.8722,-1.5067,-0.2872,1.4905,0.5785,0.2464,0.0841,1.5629,0.5392,0.1063,-0.9628,
  -1.3641,-2.2998,1.0469,-0.3418,0.8668,0.2199,-1.0545,-0.2883,0.7008,0.0900,-0.4463,-0.1323,0.7154,
  1.2077,0.4784,0.1704,0.7064,-0.9403,1.1715,2.4885,-2.3435,-0.6139,-0.5304,-0.2291,0.5170,-1.7088,
  0.8902,-0.8025,1.1364,0.6513,-1.6044,1.6628,-0.7016,-0.2370,1.2484,-0.3178,-1.4907,-0.0778,1.5050,
  -0.4863,0.4100,-0.9315,2.6336,-2.1173,-1.0618,-0.0568,0.2498,-1.0658,-1.2619,0.2455,-0.2223,0.3813,
  1.3934,0.1586,-0.8637,-0.5552,-0.4816,1.9035,0.8826,-0.4048,1.8588,0.4547,1.6757,0.1098,-0.2461,
  -2.3133,0.3132,-0.5737,-0.7751,0.5027,1.9208,-0.7768,-0.6828,0.9601,-0.1202,-0.9207,-0.0866,-1.3751,
  0.2511,-1.2562,-0.0347,-0.3698,0.9724,0.2230,-0.6816,-0.9420,0.5300,1.5346,1.1600,1.5815,0.1751,
  -0.3129,1.2613,-1.0866,0.2284,0.8649,1.2168,1.7557,0.4355,-0.3651,1.0202,-0.6604,-1.0494,0.4124,
  -1.0330,0.2489,1.1755,0.7988,0.6594,-1.3470,0.8841,-0.3089,-2.0961,0.7462,-1.2915,0.9192,-1.5891,
  -2.6218,-1.6596,0.8073,-0.3482,1.2588,-0.9722,-0.0069,1.7402,0.0845,-0.6768,1.4390,-0.3400,-1.0901,
  -0.4229,1.3568,-0.6793,-0.0684,-1.2259,-3.1737,0.1792,-0.8417,0.4124,-1.3748,0.1849,-0.5775,-0.5275,
  -0.3407,-0.9867,-0.1361,0.9879,-0.3099,-0.4496,-1.3641,-2.8668,-0.3789,0.7859,-0.8609,1.5311,-0.1198,
  -0.0019,0.4794,0.8485,-0.9582,-0.9341,-0.8395,-0.7850,-0.6357,0.6514,0.3007,0.7098,1.4739,-1.2402,
  -1.0944,-0.1571,-2.1043,-0.7533,1.3553,1.2964,1.4505,0.2564,1.9812,0.9806,-1.0337,-0.7853,-0.6138,
  0.6903,-0.9451,-0.2840,-1.6451,-0.5696,-0.5773,0.7141,-0.3532,1.1156,-1.4451,1.7159,-0.2223,0.2588,
  -0.8497,0.1078,1.1759,-0.5046,-1.7174,-0.1599,-2.2034,-1.3003,0.5747,-0.5880,-0.9331,-0.0059,0.6067,
  0.8983,-0.3128,0.1937,-0.0236,0.0084,-0.2336,-0.1223,-0.2536,-1.3198,-1.3142,0.8060,1.5004,0.7110,
  0.8358,-0.1719,0.3716,-0.0425,0.3777,-0.1940,-0.5049,0.1067,1.0942,-1.6675,1.1942,-0.0957,0.3706,
  1.4143,2.4142,1.1641,0.9302,-0.6297,-1.1920,1.2045,-1.9450,-0.2355,-0.7365,-0.8010,-0.1886,1.4821,
  0.7371,0.0349,-1.3537,-1.5817,0.9415,0.2873,1.8814,0.1434,-0.1181,-1.9292,1.1517,-0.3855,0.7864,
  -0.7832,-1.6565,0.2667,-0.9098,-0.4747,-2.8992,-0.4760,0.9969,-1.3062,0.5083,0.4385,-1.3718,0.6758,
  -0.8908,-0.7876,-1.3083,1.2034,-1.2432,0.8728,0.0323,1.2894,0.1995,-1.3469,0.9336,0.1428,2.2733,
  -0.8905,-0.3605,0.2646,1.2321,-0.7571,0.2506,-0.4947,0.2657,-0.7457,0.3213,-2.4649,-0.2285,-0.1683,-0.7318,-0.0250];

for (let i = 0; i < 40; i++){
  for(let j = 0; j <= i; j++) {
    let x = W[i * 40 + j];
    W[i * 40 + j] = W[i + j * 40];
    W[i + j * 40] = x;
  }
}

function detectWatermark (imageData) {

  let payload = -1;

  const rows = imageData instanceof cv.Mat ? imageData.rows : -1;
  const cols = imageData instanceof cv.Mat ? imageData.cols : -1;


  let A = [0.2500, -0.5000, 0.2500, -0.5000, 1.0000, -0.5000, 0.2500, -0.5000, 0.2500];
  //let Am = cv.matFromArray(3, 3, cv.CV_64FC1, A); // this was commented! (matFromArray)
  let Am = matFromArray(3, 3, cv.CV_64FC1, A);
  //let filtered = new cv.Mat(); // his was commented! (matFromArray)
  let anchor = new cv.Point(-1, -1);

  // 2D convolution - image filtering //
  //cv.filter2D(imageData, filtered, cv.CV_64F, Am, anchor, 0, cv.BORDER_ISOLATED); // this was commented! (matFromArray)
  let filtered = imageData.filter2D(cv.CV_64F, Am, anchor, 0, cv.BORDER_ISOLATED); 

  let c = Math.floor(cols / M);
  let r = Math.floor(rows / M);
  
  // preparing the matrices for Fourier domain operations 
  //let rep = new cv.Mat.zeros(M, M, cv.CV_64F);//delete // this was commented! (matFromArray)
  let rep = new cv.Mat(M, M, cv.CV_64F, 0);
  for (let ii = 0; ii < M; ii++) {

    for (let jj = 0; jj < M; jj++) {

      //rep.doublePtr(ii,jj)[0] = 0; //!! // this was commented! (matFromArray)
      rep.set(ii, jj, 0);

      for (let j1 = 0; j1 < r; j1++) {

        for (let j2 = 0; j2 < c; j2++) {

          //rep.doublePtr(ii,jj)[0] +=                        // this was commented! (matFromArray)
          //  filtered.doubleAt(ii + j1 * M, jj + j2 * M);    // this was commented! (matFromArray)
          rep.set(ii, jj, filtered.at(ii + j1 * M, jj + j2 * M));
        }
      }
    }
  }

  // !! NEW
  let _rep = [];

  for (let i = 0; i < M; i++) {

    for (let j = 0; j < M; j++) {

      //_rep.push(rep.doubleAt(i, M - j - 1)); // this was commented! (matFromArray)
      _rep.push(rep.at(i, M - j - 1));
    }
  }
  //console.log(_rep)
  //console.log(filtered)
  //let x = phaseOnly(conj(fft2(W)));
  //console.log(x.get(0).data64F, x.get(1).data64F)
  // R=ifft2(phaseOnly(fft2(rep)).*phaseOnly(conj(fft2(W))));
  let R = ifft2(
    dotMultiply(
      phaseOnly(fft2(_rep)),
      phaseOnly(conj(fft2(W)))
    )
  );
  //console.log(R.get(0).data64F)

  // R = abs(R)
  let Ra = abs(R);
  //console.log(Ra)
  

  let nbits = Math.floor(Math.log2(M) - 1);
  let threshold = 0.2;// 0.2

  let found = find(Ra, threshold); // 'Ra' is abs(R)
  //console.log(found);
  if (found.x.length == 2) {
    let dx = found.x[1] - found.x[0];
    let dy = found.y[1] - found.y[0];
    //if (Math.abs(dx) < M/2 && Math.abs(dy) < M/2) {
    if (Math.abs(dx) < M/2 && Math.abs(dy) < M/2) {
      payload =
      bin2dec(
        dec2bin(Math.abs(dy), nbits) +
        dec2bin(Math.abs(dx), nbits)
      );

    }
  }

  //filtered.delete(); // this was commented! (matFromArray)

  //R.delete(); // this was commented! (matFromArray)

  //imageData.delete(); // this was commented! (matFromArray)

  decoding = false;

  return payload;
}

function processFrame(frame) {
  
  let frameData = frame.getDataAsArray();

  let clampedArrayRgb = new Uint8ClampedArray(frameData, 54).reverse();
  //let clampedArrayBgr = new Uint8ClampedArray(frame, 54);
  
  //let rgbImage = new cv.matFromArray(360, 640, cv.CV_8UC3, clampedArrayRgb);// this was commented! (matFromArray)
  let rgbImage = new matFromArray(360, 640, cv.CV_8UC3, clampedArrayRgb);

  //let bgrImage = new cv.matFromArray(360, 640, cv.CV_8UC3, clampedArrayBgr);

  //let grayImage = new cv.Mat(360, 640, cv.CV_8UC1); // this was commented! (matFromArray)
  //cv.cvtColor(rgbImage, grayImage, cv.COLOR_RGB2GRAY, 1); // this was commented! (matFromArray)
  //cvtColor(rgbImage, grayImage, cv.COLOR_RGB2GRAY, 1); // this was commented! (matFromArray)
  let grayImage = rgbImage.cvtColor(cv.COLOR_RGB2GRAY, 1);
  //cv.cvtColor(bgrImage, grayImage, cv.COLOR_BGR2GRAY, 1);

  let payload = detectWatermark(grayImage);

  console.log('PAYLOAD', payload)

  //rgbImage.delete(); //this was commented! (matFromArray)

}
