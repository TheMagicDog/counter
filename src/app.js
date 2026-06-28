function init() {
  // Force scroll restoration to manual and scroll to top on load
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);

  const presentationMultiplier = 18;

  const displayBack = document.getElementById('counter-display-back');
  const displayBackDigits = displayBack.querySelector('.digits-span');
  const displayBackSuffix = displayBack.querySelector('.suffix-span');
  const layerBase = document.querySelector('.layer-base');
  
  const layoutContainer = document.querySelector('.main-layout-container');
  const columnLeft = document.querySelector('.column-left');
  const columnRight = document.querySelector('.column-right');
  const cardTitle = document.getElementById('card-title');
  const cardDescription = document.getElementById('card-description');
  const numbersReel = document.getElementById('numbers-reel');
  const reelItems = document.querySelectorAll('.reel-item');
  const morphSvg = document.getElementById('morph-svg');
  const morphPath = document.getElementById('morph-path');
  const finalCardsContainer = document.querySelector('.final-cards-container');
  const finalScreen = document.getElementById('final-screen');
  
  // Decorative lines initialization
  const primaLinea = document.getElementById('prima-linea');
  let primaLineaPath = null;
  let primaLineaLength = 0;
  if (primaLinea) {
    primaLineaPath = primaLinea.querySelector('path');
    if (primaLineaPath) {
      primaLineaLength = primaLineaPath.getTotalLength();
      primaLineaPath.style.strokeDasharray = primaLineaLength;
      primaLineaPath.style.strokeDashoffset = primaLineaLength;
    }
  }

  // Brush mask path initialization
  const maskBrushPath = document.getElementById('mask-brush-path');
  let brushLength = 0;
  if (maskBrushPath) {
    brushLength = maskBrushPath.getTotalLength();
    maskBrushPath.style.strokeDasharray = brushLength;
    maskBrushPath.style.strokeDashoffset = brushLength;
  }
  
  // Cache to store the current morph card size and avoid layout thrashing
  let lastCardWidth = 0;
  let lastCardHeight = 0;

  const debugRunId = 'post-fix';

  const lerp = (start, end, t) => start + (end - start) * t;

  function getReelItemStyle(d) {
    let opacity = 0;
    let r = 255, g = 255, b = 255;
    if (d <= -0.5) {
      opacity = 0;
    } else if (d < 0) {
      const t = (d - (-0.5)) / 0.5;
      opacity = t;
      r = 255; g = 255; b = 255;
    } else if (d <= 1) {
      opacity = 1.0 - 0.75 * d; // lerp from 1.0 to 0.25
      r = 255 - 95 * d; // lerp from 255 to 160
      g = 255 - 95 * d;
      b = 255 - 95 * d;
    } else if (d <= 1.2) {
      const t = (d - 1) / 0.2;
      opacity = 0.25 * (1 - t);
      r = 160; g = 160; b = 160;
    } else {
      opacity = 0;
    }
    return { opacity, color: `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})` };
  }

  function parsePath(d) {
    const matches = d.match(/[-+]?[0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?/g);
    return matches.map(Number);
  }

  function buildPath(numbers) {
    return `M${numbers[0]} ${numbers[1]}C${numbers[2]} ${numbers[3]} ${numbers[4]} ${numbers[5]} ${numbers[6]} ${numbers[7]}L${numbers[8]} ${numbers[9]}C${numbers[10]} ${numbers[11]} ${numbers[12]} ${numbers[13]} ${numbers[14]} ${numbers[15]}L${numbers[16]} ${numbers[17]}C${numbers[18]} ${numbers[19]} ${numbers[20]} ${numbers[21]} ${numbers[22]} ${numbers[23]}L${numbers[24]} ${numbers[25]}C${numbers[26]} ${numbers[27]} ${numbers[28]} ${numbers[29]} ${numbers[30]} ${numbers[31]}L${numbers[32]} ${numbers[33]}Z`;
  }

  const lerpArray = (arr1, arr2, t) => arr1.map((val, idx) => lerp(val, arr2[idx], t));

  const cards = [
    {
      title: "VISUALIZ-\nZAZIONI",
      number: "22",
      suffix: "MLD",
      description: "Quasi tre volte l'intera popolazione mondiale. Un flusso ininterrotto di sguardi incollati ai video di queste Olimpiadi Invernali.",
      color: [83, 62, 220],
      viewBox: [609, 378],
      path: parsePath("M83.4264 31.2829C87.2475 17.6812 99.5363 8.19496 113.662 7.94264L558.038 0.00519967C575.234 -0.301956 589.597 13.0383 590.559 30.2101L608.13 343.844C609.175 362.495 594.089 378.072 575.414 377.625L31.2516 364.587C10.3741 364.087 -4.43754 344.047 1.21056 323.942L83.4264 31.2829Z")
    },
    {
      title: "UTENTI\nATTIVI",
      number: "1.0",
      suffix: "MLD",
      description: "Un traguardo straordinario raggiunto grazie al coinvolgimento della community in tutto il mondo.",
      color: [220, 62, 65],
      viewBox: [540, 382],
      path: parsePath("M0.0335474 33.4578C-0.820912 14.7085 14.5698 -0.747219 33.3225 0.0282694L500.709 19.3563C517.469 20.0493 530.849 33.5665 531.371 50.3324L539.964 326.123C540.508 343.582 526.95 358.252 509.502 359.083L47.9735 381.061C30.2949 381.903 15.2903 368.234 14.4845 350.554L0.0335474 33.4578Z")
    },
    {
      title: "INTER-\nAZIONI",
      number: "27",
      suffix: "MLN",
      description: "Commenti, condivisioni e reazioni registrati durante la cerimonia di chiusura.",
      color: [220, 149, 62],
      viewBox: [526, 408],
      path: parsePath("M49.1307 27.1183C51.6293 10.931 65.9476 -0.756537 82.3074 0.0374486L468.481 18.7795C484.527 19.5583 497.509 32.1137 498.823 48.125L525.507 373.338C527.1 392.756 511.116 409.08 491.668 407.895L30.0603 379.775C11.2573 378.629 -2.49307 361.57 0.380597 342.953L49.1307 27.1183Z")
    }
  ];

  const backgroundCard = {
    color: [220, 62, 204],
    viewBox: [1512, 870],
    path: parsePath("M0 32C0 14.3269 14.3269 0 32 0L1480 0C1497.6731 0 1512 14.3269 1512 32L1512 838C1512 855.6731 1497.6731 870 1480 870L32 870C14.3269 870 0 855.6731 0 838L0 32Z")
  };

  const startTrapezoid = {
    color: [220, 62, 204],
    viewBox: [1512, 870],
    path: parsePath("M0 32C0 14.3269 14.3269 0 32 0L1480 0C1497.6731 0 1512 14.3269 1512 32L1512 838C1512 855.6731 1497.6731 870 1480 870L32 870C14.3269 870 0 855.6731 0 838L0 32Z")
  };

  const intermediateTrapezoid = {
    color: [220, 62, 204],
    viewBox: [1512, 870],
    path: parsePath("M0 32C0 14.3269 14.3269 0 32 0L1480 0C1497.6731 0 1512 14.3269 1512 32L1512 838C1512 855.6731 1497.6731 870 1480 870L32 870C14.3269 870 0 855.6731 0 838L0 32Z")
  };

  const rectCardRounded = {
    color: [83, 62, 220],
    viewBox: [600, 400],
    path: parsePath("M0 30C0 13.5 13.5 0 30 0L570 0C586.5 0 600 13.5 600 30L600 370C600 386.5 586.5 400 570 400L30 400C13.5 400 0 386.5 0 370L0 30Z")
  };

  const rectCardSharp = {
    color: [83, 62, 220],
    viewBox: [600, 400],
    path: parsePath("M0 0C0 0 0 0 0 0L600 0C600 0 600 0 600 0L600 400C600 400 600 400 600 400L0 400C0 400 0 400 0 400L0 0Z")
  };

  function getCardState(progress) {
    const isMobile = window.innerWidth <= 900;
    const desktopCardWidth = Math.min(window.innerWidth * 0.33, 609);
    const mobileCardWidth = Math.min(window.innerWidth * 0.85, 609);
    const targetCardWidth = isMobile ? mobileCardWidth : desktopCardWidth;
    const scale = targetCardWidth / 609;

    const startWidth = window.innerWidth;
    const startHeight = window.innerHeight;

    let path, color, width, height, cardWidth, cardHeight;
    let textIndex, textOpacity, textTranslateY;
    let counterOpacity, cardTextOpacity, columnsOpacity;
    let numChars, fontSize, suffixText;
    let activeIndex = 0;
    let finalScreenOpacity = 0;
    let textY = 0;

    // Phase 1: Rolling Counter & Transition to Card 1
    if (progress < totalPhase1Max) {
      const fillStart = fillPhaseStart1; // 0.37
      activeIndex = 0;
      
      if (progress < fillStart) {
        // Just rolling counter - Stage 1 morphing
        const t = progress / fillStart;
        path = lerpArray(startTrapezoid.path, intermediateTrapezoid.path, t);
        color = backgroundCard.color;
        width = backgroundCard.viewBox[0];
        height = backgroundCard.viewBox[1];
        cardWidth = startWidth * 1.25;
        cardHeight = startHeight * 1.25;
        
        counterOpacity = 1;
        cardTextOpacity = 0;
        columnsOpacity = 0;
        
        textIndex = 0;
        textOpacity = 0;
        textTranslateY = 0;
        numChars = 14;
        fontSize = 19;
        suffixText = "";
        textY = startHeight * 0.38;
      } else if (progress < suspensionEnd1) {
        // Suspension Phase: Keep card fully brushed, full-size, static 22 MLD count
        path = startTrapezoid.path;
        color = backgroundCard.color;
        width = backgroundCard.viewBox[0];
        height = backgroundCard.viewBox[1];
        cardWidth = startWidth * 1.25;
        cardHeight = startHeight * 1.25;
        
        counterOpacity = 1;
        cardTextOpacity = 0;
        columnsOpacity = 0;
        
        textIndex = 0;
        textOpacity = 0;
        textTranslateY = 0;
        numChars = 14;
        fontSize = 19;
        suffixText = "";
        textY = startHeight * 0.38;
      } else {
        // Transition Card 0 -> Card 1 - Stage 2 morphing
        const t = (progress - suspensionEnd1) / (totalPhase1Max - suspensionEnd1);
        const easedT = softEase(t);
        textY = lerp(startHeight * 0.38, 0, easedT);
        
        // Distort background container dynamically through Card 3 and Card 2 geometries
        if (easedT < 0.3333) {
          const t1 = easedT / 0.3333;
          path = lerpArray(intermediateTrapezoid.path, cards[2].path, t1);
          color = lerpArray(backgroundCard.color, cards[0].color, easedT);
          width = lerp(1512, cards[2].viewBox[0], t1);
          height = lerp(870, cards[2].viewBox[1], t1);
          
          const endW = cards[2].viewBox[0] * scale;
          const endH = cards[2].viewBox[1] * scale;
          cardWidth = lerp(startWidth * 1.25, endW, t1);
          cardHeight = lerp(startHeight * 1.25, endH, t1);
        } else if (easedT < 0.6666) {
          const t2 = (easedT - 0.3333) / 0.3333;
          path = lerpArray(cards[2].path, cards[1].path, t2);
          color = lerpArray(backgroundCard.color, cards[0].color, easedT);
          width = lerp(cards[2].viewBox[0], cards[1].viewBox[0], t2);
          height = lerp(cards[2].viewBox[1], cards[1].viewBox[1], t2);
          
          const startW = cards[2].viewBox[0] * scale;
          const startH = cards[2].viewBox[1] * scale;
          const endW = cards[1].viewBox[0] * scale;
          const endH = cards[1].viewBox[1] * scale;
          cardWidth = lerp(startW, endW, t2);
          cardHeight = lerp(startH, endH, t2);
        } else {
          const t3 = (easedT - 0.6666) / 0.3334;
          path = lerpArray(cards[1].path, cards[0].path, t3);
          color = lerpArray(backgroundCard.color, cards[0].color, easedT);
          width = lerp(cards[1].viewBox[0], cards[0].viewBox[0], t3);
          height = lerp(cards[1].viewBox[1], cards[0].viewBox[1], t3);
          
          const startW = cards[1].viewBox[0] * scale;
          const startH = cards[1].viewBox[1] * scale;
          const endW = cards[0].viewBox[0] * scale;
          const endH = cards[0].viewBox[1] * scale;
          cardWidth = lerp(startW, endW, t3);
          cardHeight = lerp(startH, endH, t3);
        }
        
        counterOpacity = 1; // Stay fully visible during deletion
        cardTextOpacity = easedT;
        columnsOpacity = easedT;
        
        textIndex = 0;
        textOpacity = easedT;
        textTranslateY = 30 * (1 - easedT);

        // Deletion (backspace) math: truncate from 14 chars down to 2 in the first 70% of transition
        if (easedT < 0.7) {
          const backspaceT = easedT / 0.7;
          numChars = Math.round(lerp(14, 2, backspaceT));
        } else {
          numChars = 2;
        }
        
        // Font-size scaling: 19vw down to target (12.5vw desktop, 22vw mobile)
        const targetFontSize = isMobile ? 22 : 12.5;
        fontSize = lerp(19, targetFontSize, easedT);

        // Suffix typing effect: types "MLD" letter-by-letter in the remaining 30% of transition
        if (easedT < 0.7) {
          suffixText = "";
        } else {
          const suffixT = (easedT - 0.7) / 0.3;
          const numSuffixChars = Math.round(lerp(0, 3, suffixT));
          suffixText = "MLD".substring(0, numSuffixChars);
        }
      }
    } else {
      // Phase 2: Morphing between cards and transition to Step 4 (Full Screen)
      const progress2 = Math.min(Math.max((progress - totalPhase1Max) / (1 - totalPhase1Max), 0), 1);
      
      counterOpacity = 0;
      cardTextOpacity = 1;
      columnsOpacity = 1;
      finalScreenOpacity = 0;
      numChars = 2;
      fontSize = isMobile ? 22 : 12.5;
      
      if (progress2 < 0.15) {
        // Card 1 Static
        path = cards[0].path;
        color = cards[0].color;
        width = cards[0].viewBox[0];
        height = cards[0].viewBox[1];
        
        textIndex = 0;
        textOpacity = 1;
        textTranslateY = 0;
        activeIndex = 0;
      } else if (progress2 < 0.30) {
        // Transition 1 -> 2
        const t = (progress2 - 0.15) / 0.15;
        path = lerpArray(cards[0].path, cards[1].path, t);
        color = lerpArray(cards[0].color, cards[1].color, t);
        width = lerp(cards[0].viewBox[0], cards[1].viewBox[0], t);
        height = lerp(cards[0].viewBox[1], cards[1].viewBox[1], t);
        
        activeIndex = t;
        if (t < 0.3) {
          textIndex = 0;
          const fadeT = t / 0.3;
          textOpacity = 1 - fadeT;
          textTranslateY = -30 * fadeT;
        } else if (t < 0.4) {
          textIndex = 1; // Content swapped while invisible
          textOpacity = 0;
          textTranslateY = -30;
        } else {
          textIndex = 1;
          const fadeT = (t - 0.4) / 0.6;
          textOpacity = fadeT;
          textTranslateY = 30 * (1 - fadeT);
        }
      } else if (progress2 < 0.45) {
        // Card 2 Static
        path = cards[1].path;
        color = cards[1].color;
        width = cards[1].viewBox[0];
        height = cards[1].viewBox[1];
        
        textIndex = 1;
        textOpacity = 1;
        textTranslateY = 0;
        activeIndex = 1;
      } else if (progress2 < 0.60) {
        // Transition 2 -> 3
        const t = (progress2 - 0.45) / 0.15;
        path = lerpArray(cards[1].path, cards[2].path, t);
        color = lerpArray(cards[1].color, cards[2].color, t);
        width = lerp(cards[1].viewBox[0], cards[2].viewBox[0], t);
        height = lerp(cards[1].viewBox[1], cards[2].viewBox[1], t);
        
        activeIndex = 1 + t;
        if (t < 0.3) {
          textIndex = 1;
          const fadeT = t / 0.3;
          textOpacity = 1 - fadeT;
          textTranslateY = -30 * fadeT;
        } else if (t < 0.4) {
          textIndex = 2; // Content swapped while invisible
          textOpacity = 0;
          textTranslateY = -30;
        } else {
          textIndex = 2;
          const fadeT = (t - 0.4) / 0.6;
          textOpacity = fadeT;
          textTranslateY = 30 * (1 - fadeT);
        }
      } else if (progress2 < 0.75) {
        // Card 3 Static
        path = cards[2].path;
        color = cards[2].color;
        width = cards[2].viewBox[0];
        height = cards[2].viewBox[1];
        
        textIndex = 2;
        textOpacity = 1;
        textTranslateY = 0;
        activeIndex = 2;
      } else if (progress2 < 0.82) {
        // Transition 3 -> 4 (Full Screen) - completes at progress = 0.91 (progress2 = 0.82)
        const t = (progress2 - 0.75) / 0.07;
        const easedT = bezierEase(t);
        
        // Piecewise corner morphing (Rounded rectangle first, then slowly sharpening at the end)
        if (easedT < 0.75) {
          const tSeg = easedT / 0.75;
          path = lerpArray(cards[2].path, rectCardRounded.path, tSeg);
        } else {
          const tSeg = (easedT - 0.75) / 0.25;
          path = lerpArray(rectCardRounded.path, rectCardSharp.path, tSeg);
        }

        color = lerpArray(cards[2].color, rectCardSharp.color, easedT);
        width = lerp(cards[2].viewBox[0], rectCardSharp.viewBox[0], easedT);
        height = lerp(cards[2].viewBox[1], rectCardSharp.viewBox[1], easedT);
        
        textIndex = 2;
        textOpacity = 1 - easedT;
        textTranslateY = -30 * easedT;
        activeIndex = 2;
        columnsOpacity = 1 - easedT;
        finalScreenOpacity = 0; // Keep text hidden during transition to show it only when fully expanded
      } else {
        // Card 4 Static (Full Screen)
        path = rectCardSharp.path;
        color = rectCardSharp.color;
        width = rectCardSharp.viewBox[0];
        height = rectCardSharp.viewBox[1];
        
        textIndex = 2;
        textOpacity = 0;
        textTranslateY = -30;
        activeIndex = 2;
        columnsOpacity = 0;
        finalScreenOpacity = 1;
      }
      
      if (progress2 < 0.75) {
        cardWidth = width * scale;
        cardHeight = height * scale;
      } else if (progress2 < 0.82) {
        const t = (progress2 - 0.75) / 0.07;
        const easedT = bezierEase(t);
        cardWidth = lerp(cards[2].viewBox[0] * scale, startWidth * 1.1, easedT);
        cardHeight = lerp(cards[2].viewBox[1] * scale, startHeight * 1.1, easedT);
      } else {
        cardWidth = startWidth * 1.1;
        cardHeight = startHeight * 1.1;
      }
      
      suffixText = cards[textIndex].suffix;
    }

    return {
      progress,
      path, color, width, height, cardWidth, cardHeight,
      textIndex, textOpacity, textTranslateY,
      counterOpacity, cardTextOpacity, columnsOpacity, finalScreenOpacity,
      numChars, fontSize, suffixText, activeIndex,
      autoScrollTime, // Pass the current autoScrollTime to DOM updates
      textY
    };
  }

  let lastTextIndex = -1;

  function updateCardDOM(state) {
    const pathD = buildPath(state.path);
    morphPath.setAttribute('d', pathD);
    
    const fillRGB = `rgb(${Math.round(state.color[0])}, ${Math.round(state.color[1])}, ${Math.round(state.color[2])})`;
    morphPath.setAttribute('fill', fillRGB);
    
    morphSvg.setAttribute('viewBox', `0 0 ${state.width} ${state.height}`);

    // Brush mask animation & toggling
    const morphCardClip = document.querySelector('.morph-card-clip');
    if (state.progress < suspensionEnd1) {
      morphPath.setAttribute('mask', 'url(#brush-mask)');
      if (morphCardClip) {
        morphCardClip.style.mask = 'url(#brush-mask)';
        morphCardClip.style.webkitMask = 'url(#brush-mask)';
      }
      
      if (maskBrushPath && brushLength > 0) {
        const brushProgress = Math.min(Math.max(state.progress / fillPhaseStart1, 0), 1);
        maskBrushPath.style.strokeDashoffset = brushLength * (1 - brushProgress);
        
        // Animate stroke width from thin (2px) to thick (400px) based on scroll progress
        const currentStrokeWidth = lerp(2, 400, brushProgress);
        maskBrushPath.setAttribute('stroke-width', currentStrokeWidth);
      }
    } else {
      morphPath.removeAttribute('mask');
      if (morphCardClip) {
        morphCardClip.style.mask = 'none';
        morphCardClip.style.webkitMask = 'none';
      }
    }
    
    // Fade out drop-shadow filter during Step 4 transition to resolve lag and flicker
    if (state.progress !== undefined) {
      const progress2 = Math.min(Math.max((state.progress - totalPhase1Max) / (1 - totalPhase1Max), 0), 1);
      if (progress2 >= 0.75) {
        if (progress2 >= 0.99) {
          if (morphSvg.style.filter !== 'none') {
            morphSvg.style.filter = 'none';
          }
        } else {
          const shadowOpacity = 1 - (progress2 - 0.75) / 0.24;
          const filterVal = `drop-shadow(0 ${15 * shadowOpacity}px ${35 * shadowOpacity}px rgba(0, 0, 0, ${0.15 * shadowOpacity}))`;
          if (morphSvg.style.filter !== filterVal) {
            morphSvg.style.filter = filterVal;
          }
        }
      } else {
        // Let CSS handle the default static drop-shadow filter when progress is under 0.75
        if (morphSvg.style.filter !== '') {
          morphSvg.style.filter = '';
        }
      }
    }
    
    // Animate the size of .morph-card
    const morphCard = document.querySelector('.morph-card');
    if (morphCard) {
      morphCard.style.width = `${state.cardWidth}px`;
      morphCard.style.height = `${state.cardHeight}px`;
    }
    
    // Store size in cache variables for cursor glare calculations
    lastCardWidth = state.cardWidth;
    lastCardHeight = state.cardHeight;

    // Manage card text index and contents
    if (state.textIndex !== undefined) {
      if (lastTextIndex !== state.textIndex) {
        const cardData = cards[state.textIndex];
        cardTitle.textContent = cardData.title;
        cardDescription.textContent = cardData.description;
        lastTextIndex = state.textIndex;
      }
      
      const transformStr = `translate3d(0, ${state.textTranslateY}px, 0)`;
      const activeTextOpacity = state.cardTextOpacity * state.textOpacity;
      
      cardTitle.style.opacity = activeTextOpacity;
      cardTitle.style.transform = transformStr;
      
      const titleColor = `rgb(${Math.round(state.color[0])}, ${Math.round(state.color[1])}, ${Math.round(state.color[2])})`;
      cardTitle.style.color = titleColor;
      
      cardDescription.style.opacity = activeTextOpacity;
      cardDescription.style.transform = transformStr;
    }

    // Manage numbers reel translation and item opacities/colors
    if (numbersReel) {
      const isMobile = window.innerWidth <= 900;
      const reelItemHeightVw = isMobile ? 21.2 : 12;
      const translation = state.activeIndex * reelItemHeightVw;
      
      numbersReel.style.transform = `translate3d(0, -${translation}vw, 0)`;
      numbersReel.style.opacity = state.columnsOpacity;
      
      // Update individual reel items
      reelItems.forEach((item, index) => {
        const d = index - state.activeIndex;
        const style = getReelItemStyle(d);
        
        let itemOpacity = style.opacity;
        if (state.counterOpacity > 0) {
          if (index === 0) {
            itemOpacity = 0; // Hide active reel item while rolling counter is visible
          } else {
            // Fade shadow reel items in sync with overall card text opacity
            itemOpacity = style.opacity * state.cardTextOpacity;
          }
        }
        item.style.opacity = itemOpacity;
        
        // Apply color to both digits and suffix inside this item
        const digits = item.querySelector('.number-digits');
        const suffix = item.querySelector('.number-suffix');
        if (digits) digits.style.color = style.color;
        if (suffix) suffix.style.color = style.color;

        // Apply skew and scale distortion based on the distance d from the active center
        const wrapper = item.querySelector('.number-wrapper');
        if (wrapper) {
          const skewAngle = d * -12; // Slant to the right (negative skewX)
          const scaleVal = 1 - 0.05 * Math.abs(d); // Scale slightly down
          wrapper.style.transform = `skewX(${skewAngle}deg) scale(${scaleVal})`;
          wrapper.style.transformOrigin = 'center center';
        }
      });
    }

    // Manage counter display text truncation and font-size
    if (state.counterOpacity > 0) {
      displayBack.style.display = 'block';
      displayBack.style.opacity = state.counterOpacity;
      
      const currentText = displayBackDigits.textContent;
      let truncated = currentText;
      if (currentText.length > state.numChars) {
        truncated = currentText.substring(0, state.numChars);
      }
      displayBackDigits.textContent = truncated;
      displayBackSuffix.textContent = state.suffixText;
      
      displayBack.style.fontSize = `${state.fontSize}vw`;
      
      if (state.progress < fillPhaseStart1) {
        displayBack.style.color = '#F5B2EF';
      } else if (state.progress < suspensionEnd1) {
        const suspensionProgress = Math.min(Math.max((state.progress - fillPhaseStart1) / (suspensionEnd1 - fillPhaseStart1), 0), 1);
        const textR = lerp(245, 255, suspensionProgress);
        const textG = lerp(178, 255, suspensionProgress);
        const textB = lerp(239, 255, suspensionProgress);
        displayBack.style.color = `rgb(${Math.round(textR)}, ${Math.round(textG)}, ${Math.round(textB)})`;
      } else {
        displayBack.style.color = '#ffffff';
      }
      
      // Animate slide-up of the counter text (positioned relative to center with textY)
      const slideY = (1 - state.counterOpacity) * 50;
      const finalY = state.textY - slideY;
      displayBack.style.transform = `translate3d(-50%, calc(-50% + ${finalY}px), 0)`;
      
      // Also update the position of the reel container
      const cardTextMask = document.querySelector('.card-text-mask');
      if (cardTextMask) {
        cardTextMask.style.transform = `translate3d(-50%, calc(-50% + ${state.textY}px), 30px)`;
      }
    } else {
      displayBack.style.display = 'none';
      displayBack.style.opacity = 0;
    }

    // Manage left/right columns opacity
    columnLeft.style.opacity = state.columnsOpacity;
    columnRight.style.opacity = state.columnsOpacity;

    // Manage decorative line 1 (prima_linea.svg) visibility/drawing
    if (primaLinea) {
      const forceVisible = document.getElementById('inspector-force-visible')?.checked;
      const progress2 = Math.min(Math.max((state.progress - 0.5) / 0.5, 0), 1);
      
      if ((state.textIndex === 2 && state.columnsOpacity > 0.1) || forceVisible) {
        primaLinea.classList.add('active');
      } else {
        primaLinea.classList.remove('active');
      }

      // Animazione del tracciato legata allo scroll in tempo reale (senza ritardo CSS)
      if (primaLineaPath && primaLineaLength > 0) {
        if (forceVisible) {
          primaLineaPath.style.strokeDashoffset = '0';
        } else {
          let offset = primaLineaLength;

          if (progress2 >= 0.45 && progress2 < 0.60) {
            // Fase 2: Disegno durante la transizione da Card 2 a Card 3
            const t = (progress2 - 0.45) / 0.15;
            offset = primaLineaLength * (1 - t);
          } else if (progress2 >= 0.60 && progress2 < 0.75) {
            // Fase 3: Completamente disegnata sulla Card 3 statica
            offset = 0;
          } else if (progress2 >= 0.75 && progress2 < 0.82) {
            // Fase 4: Cancellazione in retromarcia durante l'espansione dello sfondo blu dello Step 4
            const t = (progress2 - 0.75) / 0.07;
            offset = primaLineaLength * t;
          } else if (progress2 >= 0.82) {
            // Step 4 a schermo intero: Completamente cancellata
            offset = primaLineaLength;
          } else {
            // Prima della Card 3: Completamente cancellata
            offset = primaLineaLength;
          }

          primaLineaPath.style.strokeDashoffset = offset;
        }
      }
    }

    // Manage final screen opacity
    if (finalScreen) {
      if (activeStep === 4 && state.finalScreenOpacity > 0) {
        finalScreen.style.visibility = 'visible';
        finalScreen.style.transition = 'opacity 0.4s ease';
        finalScreen.style.opacity = state.finalScreenOpacity;
        finalScreen.style.pointerEvents = 'auto';
        
        if (!finalScreen.classList.contains('active')) {
          finalScreen.classList.add('active');
          // Start timeout for staggered entry completion to clear delays for hover
          if (entranceTimeoutId) clearTimeout(entranceTimeoutId);
          entranceTimeoutId = setTimeout(() => {
            finalScreen.classList.add('entrance-done');
          }, 2500);
        }
        
        // Calculate horizontal translation directly from vertical scroll progression
        const track = finalScreen.querySelector('.final-cards-track');
        if (track) {
          const presentationScrollHeight = presentationMultiplier * window.innerHeight;
          const scrollPosition = window.scrollY;
          const carouselStart = 0.91 * presentationScrollHeight;
          const carouselSpan = 4.0 * window.innerHeight;
          
          let progress = 0;
          if (scrollPosition > carouselStart) {
            progress = Math.min((scrollPosition - carouselStart) / carouselSpan, 1);
          }
          
          const trackWidth = track.scrollWidth;
          const viewportWidth = window.innerWidth;
          
          // Map progress from 0 (off-screen right) to 1 (off-screen left)
          const translation = viewportWidth - progress * (trackWidth + viewportWidth);
          
          // Add a gentle breathing oscillation (±20px)
          const sway = Math.sin(state.autoScrollTime / 1500) * 20;
          
          track.style.transform = `translate3d(${translation + sway}px, 0, 0)`;
        }
      } else {
        finalScreen.style.transition = 'none';
        finalScreen.style.opacity = 0;
        finalScreen.style.pointerEvents = 'none';
        finalScreen.style.visibility = 'hidden';
        
        if (finalScreen.classList.contains('active')) {
          finalScreen.classList.remove('active');
          finalScreen.classList.remove('entrance-done');
          if (entranceTimeoutId) {
            clearTimeout(entranceTimeoutId);
            entranceTimeoutId = null;
          }
        }
        
        // Reset horizontal loop offset when leaving Step 4
        const track = finalScreen.querySelector('.final-cards-track');
        if (track) {
          track.style.transform = 'translate3d(0, 0, 0)';
        }
      }
    }
  }

  const targetValue = 22000000000; // 22 Billion
  const totalPhase1Max = 0.5; // End of Macro Phase 1 scroll progress (0.0 to 0.5)
  const fillPhaseStart = 0.65; // Relative fill start (65% of Phase 1)
  const fillPhaseStart1 = fillPhaseStart * totalPhase1Max; // = 0.325
  const suspensionEnd = 0.82; // Suspension phase ends (82% of Phase 1)
  const suspensionEnd1 = suspensionEnd * totalPhase1Max; // = 0.41
  
  const formatNumber = (num) => {
    return new Intl.NumberFormat('it-IT').format(num);
  };

  // Prevent FOUT by fading in elements once fonts are fully loaded
  document.fonts.ready.then(() => {
    document.querySelectorAll('.viewport-layer').forEach(layer => {
      layer.classList.add('fonts-loaded');
    });
  });

  // Helper to solve a cubic-bezier curve in JS
  const createCubicBezierSolver = (x1, y1, x2, y2) => {
    return function(x) {
      if (x === 0 || x === 1) return x;
      
      let t = x;
      // Increased iterations to 20 for extreme curve precision
      for (let i = 0; i < 20; i++) {
        const xt = 3 * Math.pow(1 - t, 2) * t * x1 + 3 * (1 - t) * t * t * x2 + t * t * t;
        const dxt = 3 * Math.pow(1 - t, 2) * x1 + 6 * (1 - t) * t * (x2 - x1) + 3 * t * t * (1 - x2);
        
        if (Math.abs(xt - x) < 1e-6) break;
        if (Math.abs(dxt) < 1e-6) break;
        
        t = t - (xt - x) / dxt;
      }
      
      return 3 * Math.pow(1 - t, 2) * t * y1 + 3 * (1 - t) * t * t * y2 + t * t * t;
    };
  };

  // Eased progress mapping. Standard Ease-In-Out (starts slowly, speeds up in the middle, and settles gently at the target).
  const bezierEase = createCubicBezierSolver(0.42, 0, 0.58, 1);
  const bezierEaseOut = createCubicBezierSolver(0, 0, 0.2, 1);
  const softEase = createCubicBezierSolver(0.76, 0, 0.24, 1);

  let ticking = false;
  let lastScrollY = window.scrollY;
  let reactionAccumulator = 0;
  let perfSampleCounter = 0;

  // Flat brand colors for reactions (visible across all layers)
  const colors = {
    heart: '#ff2d55', // Instagram vibrant red
    like: '#1877f2'   // Facebook vibrant blue
  };

  // Helper to compile self-contained SVG with flat colors for each reaction
  const getReactionSVG = (type) => {
    const color = colors[type];
    
    if (type === 'heart') {
      return `
        <svg viewBox="0 0 24 24" style="width: 100%; height: 100%; fill: ${color}; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.05));">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      `;
    } else {
      return `
        <svg viewBox="0 0 24 24" style="width: 100%; height: 100%; fill: ${color}; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.05));">
          <path d="M2 21h4V9H2v12zM20 8h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L13.17 1 7.58 6.59C7.22 6.95 7 7.45 7 8v11c0 1.1.9 2 2 2h7c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2c0-1.1-.9-2-2-2z"/>
        </svg>
      `;
    }
  };

  // Create and animate a single floating reaction (rendered on top of all layers)
  // Can be spawned relative to screen baseline or at custom coordinates (e.g. click/tap)
  const createReaction = (numberWidth, isBurst = false, spawnX = null, spawnY = null) => {
    // 50% chance heart, 50% chance like thumb
    const reactionType = Math.random() < 0.5 ? 'heart' : 'like';

    // Scale: sizing variation (background vs foreground)
    const scale = isBurst 
      ? (0.55 + Math.random() * 0.65)
      : (0.7 + Math.random() * 0.4);

    // Rotation: initial tilt
    const rotation = (Math.random() - 0.5) * (isBurst ? 45 : 30);
    
    // Duration: rise speed
    const duration = isBurst 
      ? (0.7 + Math.random() * 0.5) 
      : (1.4 + Math.random() * 0.6);

    // Sway parameters: horizontal oscillation width and frequency
    const swayWidth = 12 + Math.random() * 20; // 12px to 32px
    const swayDuration = 0.6 + Math.random() * 0.6; // 0.6s to 1.2s

    // Drift: how far the reaction drifts horizontally as it rises
    const drift = (Math.random() - 0.5) * (isBurst ? 100 : 60);

    const containerEl = document.createElement('div');
    containerEl.className = 'reaction-container';
    
    // Position: use custom coordinate if provided (from click/tap), otherwise calculate scroll baseline spawn
    if (spawnX !== null && spawnY !== null) {
      containerEl.style.left = `${spawnX}px`;
      containerEl.style.top = `${spawnY}px`;
    } else {
      const randomX = (Math.random() - 0.5) * (numberWidth * 0.95);
      const randomY = (Math.random() - 0.5) * (isBurst ? 30 : 20);
      containerEl.style.left = `calc(50% + ${randomX}px)`;
      containerEl.style.top = `calc(50% + ${randomY}px)`;
    }

    containerEl.style.setProperty('--drift', `${drift}px`);
    containerEl.style.setProperty('--scale', scale);
    containerEl.style.setProperty('--rotation', `${rotation}deg`);
    containerEl.style.animationDuration = `${duration}s`;

    const swayEl = document.createElement('div');
    swayEl.className = 'reaction-sway';
    swayEl.style.setProperty('--sway-width', `${swayWidth}px`);
    swayEl.style.animationDuration = `${swayDuration}s`;

    // Fill with the flat color SVG content
    swayEl.innerHTML = getReactionSVG(reactionType);

    containerEl.appendChild(swayEl);
    // Append to insulated container to avoid layout thrashing the entire page
    let reactionsContainer = document.getElementById('reactions-container');
    if (!reactionsContainer) {
      reactionsContainer = document.createElement('div');
      reactionsContainer.id = 'reactions-container';
      document.body.appendChild(reactionsContainer);
    }
    reactionsContainer.appendChild(containerEl);

    // DOM Cleanup after completion
    setTimeout(() => {
      containerEl.remove();
    }, duration * 1000);
  };



  let targetProgress = 0;
  let currentProgress = 0;
  let currentProgressTop = 0;
  let currentProgressBottom = 0;
  let isAnimating = false;

  // Variables for autonomous final transition and post-transition slide-up
  let isAutonomousActive = false;
  let autonomousFillProgress = 0;
  let isCardAnimationFinished = false;
  let currentSlideProgress = 0;
  let lastFrameTime = null;

  // Auto-scroll variables for final screen (Step 4)
  let autoScrollTime = 0;
  let entranceTimeoutId = null; // To clear any active timeout when leaving Step 4



  let activeStep = 0;
  let cooldownActive = false;
  let autoscrollTargetProgress = 0.50;

  // Autoscroll variables to lock and animate from one step to another
  let isAutoscrolling = false;
  let autoscrollStartTime = null;
  let autoscrollStartScrollY = 0;
  const autoscrollDuration = 1000; // Premium 1000ms transition (Idea C)


  // activeStep is initialized to 0 because we force scroll to top on page load.

  const preventDefaultScroll = (e) => {
    if (e.type === 'keydown') {
      const keys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '];
      if (keys.includes(e.key)) {
        e.preventDefault();
        return;
      }
    } else {
      e.preventDefault();
    }
  };
  
  function lockScroll() {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  }

  function unlockScroll() {
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  }

  function triggerAutoscrollTo(targetPercent) {
    isAutoscrolling = true;
    autoscrollTargetProgress = targetPercent;
    autoscrollStartTime = null;
    autoscrollStartScrollY = window.scrollY;
    lockScroll();
    requestAnimationFrame(performAutoscroll);
  }

  function performAutoscroll(timestamp) {
    if (!isAutoscrolling) return;
    if (!autoscrollStartTime) autoscrollStartTime = timestamp;
    
    const elapsed = timestamp - autoscrollStartTime;
    const t = Math.min(elapsed / autoscrollDuration, 1);
    
    // Quartic ease-in-out curve for balanced, smooth deceleration (Idea C)
    const easeT = t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
    
    const presentationScrollHeight = presentationMultiplier * window.innerHeight;
    const scrollEnd = presentationScrollHeight * autoscrollTargetProgress;
    
    const currentScrollY = lerp(autoscrollStartScrollY, scrollEnd, easeT);
    window.scrollTo(0, currentScrollY);
    
    if (t < 1) {
      requestAnimationFrame(performAutoscroll);
    } else {
      isAutoscrolling = false;
      lastScrollY = window.scrollY;
      
      cooldownActive = true;
      setTimeout(() => {
        cooldownActive = false;
        unlockScroll();
        lastScrollY = window.scrollY;
      }, 400); // Keep overflow locked during a 400ms cooldown to completely absorb trackpad momentum
    }
  }

  function drawFrame() {
    const frameStart = performance.now();
    const presentationScrollHeight = presentationMultiplier * window.innerHeight;
    const scrollPosition = window.scrollY;
    
    // Slide up all fixed viewport elements if scrolling down to the white text section
    let exitOffset = 0;
    const carouselStart = 0.91 * presentationScrollHeight;
    const carouselSpan = 4.0 * window.innerHeight;
    const carouselEnd = carouselStart + carouselSpan;
    if (scrollPosition > carouselEnd) {
      exitOffset = scrollPosition - carouselEnd;
    }
    
    const transformStyle = exitOffset > 0 ? `translate3d(0, ${-exitOffset}px, 0)` : '';
    
    if (layerBase) {
      if (exitOffset > 0) {
        layerBase.style.transition = 'none';
        layerBase.style.transform = transformStyle;
      } else {
        layerBase.style.transition = '';
        layerBase.style.transform = '';
      }
    }
    if (layoutContainer) {
      if (exitOffset > 0) {
        layoutContainer.style.transition = 'none';
        layoutContainer.style.transform = transformStyle;
      } else {
        layoutContainer.style.transition = '';
        layoutContainer.style.transform = '';
      }
    }
    if (primaLinea) {
      if (exitOffset > 0) {
        primaLinea.style.transition = 'none';
        primaLinea.style.transform = transformStyle;
      } else {
        primaLinea.style.transition = '';
        primaLinea.style.transform = '';
      }
    }
    const reactionsContainer = document.getElementById('reactions-container');
    if (reactionsContainer) {
      if (exitOffset > 0) {
        reactionsContainer.style.transition = 'none';
        reactionsContainer.style.transform = transformStyle;
      } else {
        reactionsContainer.style.transition = '';
        reactionsContainer.style.transform = '';
      }
    }
    
    // Smoothly fade out and slide down the scroll indicator
    const scrollIndicator = document.getElementById('scroll-indicator');
    if (scrollIndicator) {
      const fadeProgress = Math.min(scrollPosition / 150, 1);
      scrollIndicator.style.opacity = 1 - fadeProgress;
      scrollIndicator.style.transform = `translate3d(-50%, ${fadeProgress * 20}px, 0)`;
    }

    const progress = currentProgress;
    
    const progress1 = Math.min(Math.max(progress / totalPhase1Max, 0), 1);
    const progress2 = Math.min(Math.max((progress - totalPhase1Max) / (1 - totalPhase1Max), 0), 1);
    
    const mainProgress1 = Math.min(progress1 / fillPhaseStart, 1);
    const fillProgress = 0;
    
    const logTarget = Math.log10(targetValue + 1);
    
    let easedProgress = 0;
    let easedMove = 0;
    let currentValue = 0;

    // Macro Phase 1: Rolling Number (0% to 85% of Phase 1 progress)
    if (mainProgress1 <= 0.85) {
      const valProgress = mainProgress1 / 0.85;
      easedProgress = bezierEase(valProgress);
      currentValue = Math.floor(Math.pow(10, easedProgress * logTarget) - 1);
      easedMove = 0;
    } 
    // Macro Phase 1: Centering & Final scaling (85% to 100% of Phase 1 progress)
    else {
      easedProgress = 1;
      currentValue = targetValue;
      const moveProgress = (mainProgress1 - 0.85) / 0.15;
      easedMove = bezierEase(moveProgress);
    }
    
    const formattedValue = formatNumber(currentValue);
    displayBackDigits.textContent = formattedValue;
    displayBackSuffix.textContent = "";

    // Morphing Card and DOM transitions
    const cardState = getCardState(progress);
    updateCardDOM(cardState);
  }

  function tickAnimation(timestamp) {
    if (!timestamp) timestamp = performance.now();
    if (!lastFrameTime) lastFrameTime = timestamp;
    const deltaTime = timestamp - lastFrameTime;
    lastFrameTime = timestamp;

    const diff = targetProgress - currentProgress;
    const diffTop = targetProgress - currentProgressTop;
    const diffBottom = targetProgress - currentProgressBottom;
    
    // Dynamic LERP coefficients: fast/responsive during manual scroll, smooth/inertial during autoscroll snapping
    const lerpRate = isAutoscrolling ? 0.08 : 0.22;
    currentProgress += diff * lerpRate;
    currentProgressTop += diffTop * (lerpRate * 0.85);
    currentProgressBottom += diffBottom * (lerpRate * 0.65);

    // Increment time-based auto-scroll timer if Step 4 is active, otherwise reset it
    if (activeStep === 4) {
      autoScrollTime += deltaTime;
    } else {
      autoScrollTime = 0;
    }

    // Check if we should trigger the autonomous final expansion (referencing Phase 1)
    if (targetProgress >= fillPhaseStart1) {
      isAutonomousActive = true;
      // Increment autonomous progress based on 850ms duration
      autonomousFillProgress += deltaTime / 850;
      if (autonomousFillProgress >= 1) {
        autonomousFillProgress = 1;
        isCardAnimationFinished = true;
      }
    } else {
      isAutonomousActive = false;
      autonomousFillProgress = 0;
      isCardAnimationFinished = false;
    }

    // Lerp the slide-up progress of the counter text linearly (lerp rate 0.05)
    const slideProgressRaw = targetProgress > fillPhaseStart1 ? Math.min((targetProgress - fillPhaseStart1) / (totalPhase1Max - fillPhaseStart1), 1) : 0;
    if (isCardAnimationFinished) {
      currentSlideProgress += (slideProgressRaw - currentSlideProgress) * 0.05;
    } else {
      currentSlideProgress += (0 - currentSlideProgress) * 0.05;
    }
    
    // Check if everything has settled. Do not settle (keep loop running) if Step 4 is active.
    const targetSlide = isCardAnimationFinished ? slideProgressRaw : 0;
    const isStep4Active = currentProgress >= 0.91;
    const isSettled = Math.abs(targetProgress - currentProgress) < 0.00005 &&
                      Math.abs(targetProgress - currentProgressTop) < 0.00005 &&
                      Math.abs(targetProgress - currentProgressBottom) < 0.00005 &&
                      (!isAutonomousActive || autonomousFillProgress === 1) &&
                      Math.abs(currentSlideProgress - targetSlide) < 0.00005 &&
                      !isStep4Active;
                      
    if (isSettled) {
      currentProgress = targetProgress;
      currentProgressTop = targetProgress;
      currentProgressBottom = targetProgress;
      currentSlideProgress = targetSlide;
      isAnimating = false;
      lastFrameTime = null; // Reset frame time when settling
      drawFrame();
      return;
    }
    
    drawFrame();
    
    requestAnimationFrame(tickAnimation);
  }

  function updateTargetProgress() {
    const presentationScrollHeight = presentationMultiplier * window.innerHeight;
    const scrollPosition = window.scrollY;
    const tempTargetProgress = presentationScrollHeight > 0 ? Math.min(Math.max(scrollPosition / presentationScrollHeight, 0), 1) : 0;
    
    targetProgress = tempTargetProgress;
    
    if (!isAnimating) {
      isAnimating = true;
      lastFrameTime = performance.now();
      requestAnimationFrame(tickAnimation);
    }
  }

  window.addEventListener('scroll', () => {
    const scrollPosition = window.scrollY;
    const deltaY = Math.abs(scrollPosition - lastScrollY);

    if (deltaY > 0) {
      // Reduced intensity: base of 0.0022 spawns 1 reaction every ~450px scrolled from the start.
      // EasedProgress scales it up to 0.006 (1 reaction every ~166px scrolled at 22 Billion).
      const easedProgress = bezierEase(currentProgress);
      const progress1 = Math.min(Math.max(currentProgress / totalPhase1Max, 0), 1);
      const fillProgress = progress1 > fillPhaseStart ? Math.min((progress1 - fillPhaseStart) / (1 - fillPhaseStart), 1) : 0;
      const fillReactionDamping = 1 - (0.75 * fillProgress);
      reactionAccumulator += deltaY * (0.0022 + easedProgress * 0.0038) * fillReactionDamping;
      reactionAccumulator = Math.min(reactionAccumulator, 4);
      
      const reactionsToSpawn = Math.min(Math.floor(reactionAccumulator), 1); // Cap to 1 per frame to reduce frequency
      reactionAccumulator -= reactionsToSpawn;

      if (reactionsToSpawn > 0) {
        const estimatedNumberWidth = window.innerWidth <= 900 ? (window.innerWidth * 0.45) : (window.innerWidth * 0.22);
        createReaction(estimatedNumberWidth);
      }
    }

    // Step snapping logic (Card 1 <-> Card 2 <-> Card 3)
    if (!isAutoscrolling && !cooldownActive) {
      const presentationScrollHeight = presentationMultiplier * window.innerHeight;
      if (presentationScrollHeight > 0) {
        const threshold = 25; // Intentional 25px trigger threshold to avoid accidental activations
        const y0 = fillPhaseStart1 * presentationScrollHeight; // threshold to trigger Step 1 from Step 0
        const y1 = 0.50 * presentationScrollHeight;
        const y2 = 0.68 * presentationScrollHeight;
        const y3 = 0.84 * presentationScrollHeight;
        const y4 = 1.00 * presentationScrollHeight;

        if (activeStep === 0) {
          if (scrollPosition > y0) {
            activeStep = 1;
            triggerAutoscrollTo(0.50);
          }
        } else if (activeStep === 1) {
          if (scrollPosition > y1 + threshold) {
            activeStep = 2;
            triggerAutoscrollTo(0.68);
          } else if (scrollPosition < y1 - threshold) {
            activeStep = 0;
            triggerAutoscrollTo(fillPhaseStart1 - 0.02);
          }
        } else if (activeStep === 2) {
          if (scrollPosition > y2 + threshold) {
            activeStep = 3;
            triggerAutoscrollTo(0.84);
          } else if (scrollPosition < y2 - threshold) {
            activeStep = 1;
            triggerAutoscrollTo(0.50);
          }
        } else if (activeStep === 3) {
          if (scrollPosition > y3 + threshold) {
            activeStep = 4;
            triggerAutoscrollTo(0.91); // Auto scroll to the START of Step 4 (0.91)
          } else if (scrollPosition < y3 - threshold) {
            activeStep = 2;
            triggerAutoscrollTo(0.68);
          }
        } else if (activeStep === 4) {
          // Only snap back to Step 3 if scrollPosition falls below the entry threshold of Step 4 (y3 - threshold)
          if (scrollPosition < y3 - threshold) {
            activeStep = 3;
            triggerAutoscrollTo(0.84);
          }
        }
      }
    }

    lastScrollY = scrollPosition;
    updateTargetProgress();
  }, { passive: true });

  // Handle window resizing (e.g. rotating device)
  window.addEventListener('resize', () => {
    const presentationScrollHeight = presentationMultiplier * window.innerHeight;
    if (presentationScrollHeight > 0) {
      let targetP = 0;
      if (activeStep === 1) targetP = 0.50;
      else if (activeStep === 2) targetP = 0.68;
      else if (activeStep === 3) targetP = 0.84;
      else if (activeStep === 4) targetP = 0.91;
      else {
        const currentP = window.scrollY / presentationScrollHeight;
        targetP = Math.min(Math.max(currentP, 0), fillPhaseStart1);
      }
      window.scrollTo(0, presentationScrollHeight * targetP);
      targetProgress = targetP;
    }
    
    currentProgress = targetProgress;
    currentProgressTop = targetProgress;
    currentProgressBottom = targetProgress;
    
    if (targetProgress >= fillPhaseStart1) {
      isAutonomousActive = true;
      autonomousFillProgress = 1.0;
      isCardAnimationFinished = true;
      currentSlideProgress = targetProgress > fillPhaseStart1 ? Math.min((targetProgress - fillPhaseStart1) / (totalPhase1Max - fillPhaseStart1), 1) : 0;
    } else {
      isAutonomousActive = false;
      autonomousFillProgress = 0;
      isCardAnimationFinished = false;
      currentSlideProgress = 0;
    }
    drawFrame();
  });

  // Handle user tap/click interactions to spawn reactions at click coordinates
  window.addEventListener('pointerdown', (e) => {
    // Prevent spawning if clicking on interactive elements
    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A') return;
    
    createReaction(100, false, e.clientX, e.clientY);
  });

  // Custom cursor with inertia (glassmorphism look)
  const cursor = document.createElement('div');
  cursor.id = 'custom-cursor';
  document.body.appendChild(cursor);

  const cardGlare = document.querySelector('.card-glare');
  let mouseX = -100;
  let mouseY = -100;
  let cursorX = -100;
  let cursorY = -100;
  let hasMoved = false;
  let mouseInWindow = false;

  let targetTiltX = 0;
  let targetTiltY = 0;
  let currentTiltX = 0;
  let currentTiltY = 0;
  let targetScale = 1;
  let currentScale = 1;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    mouseInWindow = true;
    if (!hasMoved) {
      // First move: snap cursor immediately to mouse position and show it
      cursorX = mouseX;
      cursorY = mouseY;
      cursor.classList.add('visible');
      hasMoved = true;
    }
  });

  // Fade out cursor when leaving window
  document.addEventListener('mouseleave', () => {
    cursor.classList.remove('visible');
    mouseInWindow = false;
  });
  document.addEventListener('mouseenter', () => {
    if (hasMoved) {
      cursor.classList.add('visible');
      mouseInWindow = true;
    }
  });

  // Shrink cursor on click for visual click feedback
  window.addEventListener('pointerdown', () => {
    cursor.style.width = '16px';
    cursor.style.height = '16px';
  });
  window.addEventListener('pointerup', () => {
    cursor.style.width = '24px';
    cursor.style.height = '24px';
  });

  const tickCursor = () => {
    if (hasMoved) {
      // Lerp logic for smooth organic lag/inertia (0.25 speed)
      cursorX += (mouseX - cursorX) * 0.25;
      cursorY += (mouseY - cursorY) * 0.25;
      cursor.style.transform = `translate3d(calc(${cursorX}px - 50%), calc(${cursorY}px - 50%), 0)`;
    }

    // Calculate dynamic intensities based on scroll progress
    let bgIntensity = 0;
    let cardIntensity = 0;

    if (currentProgress < fillPhaseStart1) {
      // Sfondo phase: bgIntensity is 1 at progress=0 and fades to 0 at fillPhaseStart1
      bgIntensity = 1 - (currentProgress / fillPhaseStart1);
      cardIntensity = 0;
    } else {
      bgIntensity = 0;
      // Card phase: cardIntensity goes from 0 to 1
      cardIntensity = Math.min((currentProgress - fillPhaseStart1) / (totalPhase1Max - fillPhaseStart1), 1);
    }

    const mouseActive = hasMoved && mouseInWindow && mouseX >= 0 && mouseY >= 0;

    if (mouseActive) {
      const dx = mouseX - (window.innerWidth / 2);
      const dy = mouseY - (window.innerHeight / 2);
      const normalizedX = dx / (window.innerWidth / 2);
      const normalizedY = dy / (window.innerHeight / 2);

      const maxTilt = 15; // Max 15 degrees tilt for elegance

      if (bgIntensity > 0) {
        // --- 1. Sfondo Phase: Option C (Pressione 3D + Schiacciamento) ---
        // Pressione 3D: inclina la card lontano dal mouse (sollevamento opposto)
        targetTiltX = normalizedY * maxTilt * bgIntensity;
        targetTiltY = normalizedX * maxTilt * bgIntensity;

        // Scala di compressione basata sulla distanza del cursore dal centro
        const dist = Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY);
        targetScale = 1 - (0.035 * dist * bgIntensity); // Fino a ~5% di schiacciamento massimo ai bordi

        if (cardGlare) {
          cardGlare.style.opacity = 0; // No glare on full-screen background
        }
      } else if (cardIntensity > 0) {
        // --- 2. Card Phase: Standard Tilt & Glare ---
        // Inclina la card verso il mouse (sollevamento in direzione del cursore)
        targetTiltX = -normalizedY * maxTilt * cardIntensity;
        targetTiltY = -normalizedX * maxTilt * cardIntensity;
        targetScale = 1;

        // Calculate glare reflection position
        const morphCard = document.querySelector('.morph-card');
        if (morphCard && cardGlare) {
          const w = lastCardWidth || 300;
          const h = lastCardHeight || 200;
          const left = (window.innerWidth - w) / 2;
          const top = (window.innerHeight - h) / 2;
          if (w > 0 && h > 0) {
            const glareX = ((mouseX - left) / w) * 100;
            const glareY = ((mouseY - top) / h) * 100;
            cardGlare.style.backgroundImage = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0) 65%)`;
            cardGlare.style.opacity = cardIntensity * 0.85;
          }
        }
      } else {
        // Neutral point (transition state at progress = fillPhaseStart1)
        targetTiltX = 0;
        targetTiltY = 0;
        targetScale = 1;
        if (cardGlare) {
          cardGlare.style.opacity = 0;
        }
      }
    } else {
      // Inactive mouse
      targetTiltX = 0;
      targetTiltY = 0;
      targetScale = 1;
      if (cardGlare) {
        cardGlare.style.opacity = 0;
      }
    }

    // Apply tilt and scale with smooth interpolation
    currentTiltX += (targetTiltX - currentTiltX) * 0.12;
    currentTiltY += (targetTiltY - currentTiltY) * 0.12;
    currentScale += (targetScale - currentScale) * 0.12;

    const morphCard = document.querySelector('.morph-card');
    if (morphCard) {
      morphCard.style.transform = `translate3d(-50%, -50%, 0) scale3d(${currentScale}, ${currentScale}, 1) rotateX(${currentTiltX}deg) rotateY(${currentTiltY}deg)`;
    }

    requestAnimationFrame(tickCursor);
  };
  requestAnimationFrame(tickCursor);



  // Initial draw and target computation
  updateTargetProgress();
  // Ensure starts in sync immediately
  currentProgress = targetProgress;
  currentProgressTop = targetProgress;
  currentProgressBottom = targetProgress;
  if (targetProgress >= fillPhaseStart1) {
    isAutonomousActive = true;
    autonomousFillProgress = 1.0;
    isCardAnimationFinished = true;
    currentSlideProgress = targetProgress > fillPhaseStart1 ? Math.min((targetProgress - fillPhaseStart1) / (totalPhase1Max - fillPhaseStart1), 1) : 0;
  } else {
    isAutonomousActive = false;
    autonomousFillProgress = 0;
    isCardAnimationFinished = false;
    currentSlideProgress = 0;
  }
  drawFrame();
  
  // Kick off the continuous animation loop if loaded directly at Step 4
  if (targetProgress >= 0.91) {
    isAnimating = true;
    lastFrameTime = performance.now();
    requestAnimationFrame(tickAnimation);
  }

  // --- LAYOUT INSPECTOR (DEV UTILITY) ---
  const inspector = document.getElementById('layout-inspector');
  if (inspector) {
    const toggleMinBtn = document.getElementById('inspector-toggle-min');
    const selectTarget = document.getElementById('inspector-select-target');
    const customTargetInput = document.getElementById('inspector-custom-target');
    const customTargetContainer = document.getElementById('inspector-custom-target-container');
    const forceVisibleCheckbox = document.getElementById('inspector-force-visible');
    
    const sliderLeft = document.getElementById('inspector-slider-left');
    const sliderBottom = document.getElementById('inspector-slider-bottom');
    const sliderWidth = document.getElementById('inspector-slider-width');
    const sliderOpacity = document.getElementById('inspector-slider-opacity');
    
    const valLeft = document.getElementById('val-left');
    const valBottom = document.getElementById('val-bottom');
    const valWidth = document.getElementById('val-width');
    const valOpacity = document.getElementById('val-opacity');
    
    const cssOutput = document.getElementById('inspector-css-output');
    const btnCopy = document.getElementById('inspector-btn-copy');
    const copyStatus = document.getElementById('inspector-copy-status');

    let currentTarget = null;
    let currentTargetSelector = '';

    // Minimizzazione / Espansione
    const toggleMin = () => {
      const isMin = inspector.classList.toggle('minimized');
      toggleMinBtn.textContent = isMin ? '＋' : '－';
    };
    toggleMinBtn.addEventListener('click', toggleMin);
    inspector.querySelector('.inspector-header').addEventListener('click', (e) => {
      if (e.target !== toggleMinBtn) toggleMin();
    });

    // Ottiene i valori CSS correnti dell'elemento
    const updateInspectorValues = () => {
      if (!currentTarget) return;

      const style = window.getComputedStyle(currentTarget);
      
      // Calcola Left (in px)
      let leftVal = parseInt(currentTarget.style.left) || 0;
      if (!currentTarget.style.left) {
        leftVal = currentTarget.getBoundingClientRect().left;
      }
      
      // Calcola Bottom (in px)
      let bottomVal = parseInt(currentTarget.style.bottom) || 0;
      if (!currentTarget.style.bottom) {
        bottomVal = window.innerHeight - currentTarget.getBoundingClientRect().bottom;
      }

      // Calcola Width (in px)
      let widthVal = parseInt(currentTarget.style.width) || 0;
      if (!currentTarget.style.width) {
        widthVal = currentTarget.getBoundingClientRect().width;
      }

      // Calcola Opacità
      let opacityVal = parseFloat(currentTarget.style.opacity);
      if (isNaN(opacityVal)) {
        opacityVal = parseFloat(style.opacity) || 1.0;
      }

      // Aggiorna gli slider
      sliderLeft.value = leftVal;
      sliderBottom.value = bottomVal;
      sliderWidth.value = widthVal;
      sliderOpacity.value = Math.round(opacityVal * 100);

      // Aggiorna le scritte
      valLeft.textContent = leftVal + 'px';
      valBottom.textContent = bottomVal + 'px';
      valWidth.textContent = widthVal + 'px';
      valOpacity.textContent = opacityVal.toFixed(2);

      updateCSSCode();
    };

    // Genera il codice CSS e lo mostra nella textarea
    const updateCSSCode = () => {
      if (!currentTargetSelector) return;
      const opacityVal = (sliderOpacity.value / 100).toFixed(2);
      
      let cssText = `${currentTargetSelector} {\n`;
      cssText += `  left: ${sliderLeft.value}px;\n`;
      cssText += `  bottom: ${sliderBottom.value}px;\n`;
      cssText += `  width: ${sliderWidth.value}px;\n`;
      cssText += `  opacity: ${opacityVal};\n`;
      cssText += `}`;
      
      cssOutput.value = cssText;
    };

    // Applica le modifiche degli slider all'elemento target
    const applyInspectorStyles = () => {
      if (!currentTarget) return;

      currentTarget.style.left = sliderLeft.value + 'px';
      currentTarget.style.bottom = sliderBottom.value + 'px';
      currentTarget.style.width = sliderWidth.value + 'px';
      
      const opacityVal = sliderOpacity.value / 100;
      currentTarget.style.opacity = opacityVal;

      valLeft.textContent = sliderLeft.value + 'px';
      valBottom.textContent = sliderBottom.value + 'px';
      valWidth.textContent = sliderWidth.value + 'px';
      valOpacity.textContent = opacityVal.toFixed(2);

      updateCSSCode();
    };

    // Cambia l'elemento target
    const changeTarget = (selector) => {
      // Pulisci il target precedente
      if (currentTarget) {
        currentTarget.removeAttribute('data-inspector-target');
      }

      currentTargetSelector = selector;
      if (selector) {
        try {
          currentTarget = document.querySelector(selector);
          if (currentTarget) {
            currentTarget.setAttribute('data-inspector-target', 'true');
            updateInspectorValues();
            
            // Forza la visibilità se attivo
            if (forceVisibleCheckbox.checked) {
              if (selector === '#prima-linea') {
                currentTarget.classList.add('active');
              } else {
                currentTarget.style.opacity = '1';
              }
            }
          } else {
            currentTarget = null;
          }
        } catch (e) {
          currentTarget = null;
        }
      } else {
        currentTarget = null;
      }
    };

    // Listeners degli slider
    sliderLeft.addEventListener('input', applyInspectorStyles);
    sliderBottom.addEventListener('input', applyInspectorStyles);
    sliderWidth.addEventListener('input', applyInspectorStyles);
    sliderOpacity.addEventListener('input', applyInspectorStyles);

    // Gestione selezione target
    selectTarget.addEventListener('change', () => {
      const val = selectTarget.value;
      if (val === 'custom') {
        customTargetContainer.classList.remove('hidden');
        changeTarget(customTargetInput.value);
      } else {
        customTargetContainer.classList.add('hidden');
        changeTarget(val);
      }
    });

    customTargetInput.addEventListener('input', () => {
      changeTarget(customTargetInput.value);
    });

    // Checkbox visibilità
    forceVisibleCheckbox.addEventListener('change', () => {
      if (currentTargetSelector === '#prima-linea') {
        if (forceVisibleCheckbox.checked) {
          currentTarget.classList.add('active');
        } else {
          // Ritorna allo scroll naturale
          updateTargetProgress();
        }
      } else if (currentTarget) {
        currentTarget.style.opacity = forceVisibleCheckbox.checked ? '1' : (sliderOpacity.value / 100);
      }
    });

    // Copia negli appunti
    btnCopy.addEventListener('click', () => {
      navigator.clipboard.writeText(cssOutput.value)
        .then(() => {
          copyStatus.textContent = 'CSS copiato con successo! 🎉';
          setTimeout(() => { copyStatus.textContent = ''; }, 2000);
        })
        .catch(err => {
          copyStatus.textContent = 'Errore nella copia ❌';
          setTimeout(() => { copyStatus.textContent = ''; }, 2000);
        });
    });

    // --- LOGICA DI DRAG DIRETTO ---
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startBottom = 0;

    window.addEventListener('pointerdown', (e) => {
      // Ignora se clicchiamo sull'inspector o se non c'è un target valido
      if (!currentTarget || inspector.contains(e.target)) return;

      // Verifica che il click sia avvenuto dentro il target corrente
      if (currentTarget.contains(e.target) || e.target === currentTarget) {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        
        startLeft = parseInt(sliderLeft.value) || 0;
        startBottom = parseInt(sliderBottom.value) || 0;
        
        // Evita trascinamenti di testo o altri comportamenti di default del browser
        e.preventDefault();
      }
    });

    window.addEventListener('pointermove', (e) => {
      if (!isDragging || !currentTarget) return;

      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      // Calcola nuove posizioni
      const newLeft = startLeft + deltaX;
      const newBottom = startBottom - deltaY; // Y dello schermo decresce verso l'alto

      // Aggiorna gli slider
      sliderLeft.value = newLeft;
      sliderBottom.value = newBottom;

      // Applica gli stili
      applyInspectorStyles();
    });

    window.addEventListener('pointerup', () => {
      isDragging = false;
    });

    // Seleziona il primo target di default
    changeTarget('#prima-linea');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
