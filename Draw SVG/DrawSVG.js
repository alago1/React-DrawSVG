import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import "./Effects.css";

function DrawSVG(props, ref) {
  const child = React.Children.only(props.children);
  const [anim, setAnim] = useState({
    type:
      props.animation && ["comp", "decomp"].indexOf(props.animation) >= 0
        ? props.animation
        : "comp", //function
    duration: props.duration ? props.duration : 2000, //animation duration
    delay: props.delay ? props.delay : 0, //animation delay
    outlineOnly: props.outlineOnly
      ? props.outlineOnly.toLowerCase() === "true"
      : false, //if only the outline should be drawn
    easingFunction: props.easingFunction
      ? props.easingFunction
      : "cubic-bezier(1, 0.16, 1, 0.3)",
  });
  const undraw = props.undraw;

  useEffect(() => {
    if (undraw) {
      setAnim({
        type: "decomp",
        ...undraw,
      });
    }
  }, [undraw]);

  //Permits use of these functions from parent component
  useImperativeHandle(ref, () => ({
    playStartAnimation(
      duration = 2000,
      delay = 2000,
      outlineOnly = false,
      easingFunction = "cubic-bezier(1, 0.16, 1, 0.3)"
    ) {
      setAnim({
        type: "comp",
        duration: duration,
        delay: delay,
        outlineOnly: outlineOnly,
        easingFunction: easingFunction,
      });
      return new Promise((resolve) => setTimeout(resolve, duration + delay));
    },
    playEndAnimation(
      duration = 2000,
      delay = 0,
      outlineOnly = false,
      easingFunction = "cubic-bezier(0.16, 1, 0.3, 1)"
    ) {
      setAnim({
        type: "decomp",
        duration: duration,
        delay: delay,
        outlineOnly: outlineOnly,
        easingFunction: easingFunction,
      });
      return new Promise((resolve) => setTimeout(resolve, duration + delay));
    },
  }));

  let animations = `${anim.type}-outline-svg ${anim.duration}ms ${
    anim.easingFunction
  } ${anim.delay}ms forwards${
    !anim.outlineOnly // if not outline-only
      ? `, ${anim.type}-fill-svg ${anim.duration}ms ease
        ${anim.delay}ms forwards`
      : ""
  }`;

  return (
    <span
      className={anim.type}
      style={{
        animation: animations,
        ...props.style,
      }}
    >
      {child}
    </span>
  );
}

export default forwardRef(DrawSVG);
