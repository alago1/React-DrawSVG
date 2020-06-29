import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
  useMemo,
} from "react";
import { renderToString } from "react-dom/server";
import "./DrawSVG.css";

//fixes an issue were old safari browsers could not use the argument pathLength
//in the process eliminates the need to write out the pathLength argument
const fixChildPathLengths = (child) => {
  let childParsedString = new DOMParser().parseFromString(
    renderToString(child),
    "text/html"
  );
  for (let pathElem of childParsedString.getElementsByTagName("path")) {
    let path_length = pathElem.getTotalLength();
    pathElem.setAttribute(
      "style",
      `--pathLength:${path_length};${pathElem.style.cssText}`
    );
  }
  let htmlValue = childParsedString.getElementsByTagName("svg")[0].outerHTML;
  return htmlValue;
};

function DrawSVG(props, ref) {
  //animation state
  const [anim, setAnim] = useState({
    type:
      props.animation && ["comp", "decomp"].indexOf(props.animation) >= 0
        ? props.animation
        : "comp", //function
    duration: props.duration ? props.duration : 2000, //animation duration
    delay: props.delay ? props.delay : 0, //animation delay
    easingFunction: props.easingFunction ? props.easingFunction : "ease", //easing function of outline animation
    disableFilling: props.disableFilling ? props.disableFilling : false, //if only the outline should be drawn
    startTransparent: props.startTransparent ? props.startTransparent : false, //if the svg should be transparent before animation starts
  });

  const processedChild = useMemo(
    () => fixChildPathLengths(React.Children.only(props.children)),
    [props.children]
  );

  //controls 'universal' undraw commands with the state hook 'undraw'
  useEffect(() => {
    if (props.undraw) {
      setAnim({
        type: "decomp",
        ...props.undraw,
      });
    }
  }, [props.undraw]);

  //Permits use of these functions from parent component
  useImperativeHandle(ref, () => ({
    playStartAnimation(
      duration = 2000,
      delay = 0,
      easingFunction = "ease",
      disableFilling = false,
      startTransparent = false
    ) {
      setAnim({
        type: "comp",
        duration: duration,
        delay: delay,
        easingFunction: easingFunction,
        disableFilling: disableFilling,
        startTransparent: startTransparent,
      });
      return new Promise((resolve) => setTimeout(resolve, duration + delay));
    },
    playEndAnimation(
      duration = 2000,
      delay = 0,
      easingFunction = "ease",
      disableFilling = false,
      startTransparent = false
    ) {
      setAnim({
        type: "decomp",
        duration: duration,
        delay: delay,
        easingFunction: easingFunction,
        disableFilling: disableFilling,
        startTransparent: startTransparent,
      });
      return new Promise((resolve) => setTimeout(resolve, duration + delay));
    },
  }));

  const outlineAnim = `${anim.type}-outline-svg ${anim.duration}ms ${anim.easingFunction} ${anim.delay}ms forwards`;
  const fillingAnim = `${anim.type}-fill-svg ${anim.duration}ms ease ${anim.delay}ms forwards`;
  const fillDelayAnim = `delay-fill ${anim.delay}ms`;

  const fullAnimation =
    outlineAnim +
    (!anim.disableFilling ? `, ${fillingAnim}` : "") +
    (anim.type === "comp" && !anim.disableFilling && anim.startTransparent
      ? `, ${fillDelayAnim}`
      : "");

  return (
    <span
      className={anim.type}
      style={{
        animation: fullAnimation,
        ...props.style,
      }}
      dangerouslySetInnerHTML={{ __html: processedChild }}
    />
  );
}

export default forwardRef(DrawSVG);
