import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import module_styles from "./DrawSVG.module.css";

function DrawSVG(props, ref) {
  //animation state
  const [anim, setAnim] = useState({
    type:
      props.animation && ["comp", "decomp"].indexOf(props.animation) >= 0
        ? props.animation
        : "comp", //function
    duration: props.duration ?? 2000, //animation duration
    delay: props.delay ?? 0, //animation delay
    easingFunction: props.easingFunction ?? "ease", //easing function of outline animation
    disableFilling: props.disableFilling ?? false, //if only the outline should be drawn
    startTransparent: props.startTransparent ?? false, //if the svg should be transparent before animation starts
  });

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
    playStartAnimation({
      duration = 2000,
      delay = 0,
      easingFunction = "ease",
      disableFilling = false,
      startTransparent = false,
    }) {
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
    playEndAnimation({
      duration = 2000,
      delay = 0,
      easingFunction = "ease",
      disableFilling = false,
      startTransparent = false,
    }) {
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

  const computeAnimation = useCallback(() => {
    // animation names with module hashes
    const outlineAnimName = module_styles[`${anim.type}-outline-svg`];
    const fillingAnimName = module_styles[`${anim.type}-fill-svg`];
    const fillDelayAnimName = module_styles["delay-fill"];

    // css animation description
    const outlineAnim = `${outlineAnimName} ${anim.duration}ms ${anim.easingFunction} ${anim.delay}ms forwards`;
    const fillingAnim = `${fillingAnimName} ${anim.duration}ms ease ${anim.delay}ms forwards`;
    const fillDelayAnim = `${fillDelayAnimName} ${anim.delay}ms`;

    const fullAnimation =
      outlineAnim +
      (!anim.disableFilling ? `, ${fillingAnim}` : "") +
      (anim.type === "comp" && !anim.disableFilling && anim.startTransparent
        ? `, ${fillDelayAnim}`
        : "");

    return fullAnimation;
  }, [anim]);

  const animationDescription = useMemo(() => computeAnimation(), [
    computeAnimation,
  ]);

  return (
    <span
      className={`${module_styles[anim.type]} ${props.className ?? ""}`}
      style={{
        animation: animationDescription,
        ...props.style,
      }}
      ref={ref}
    >
      {React.Children.only(props.children)}
    </span>
  );
}

export default React.memo(forwardRef(DrawSVG), (prevProps, nextProps) => {
  for (const param in prevProps) {
    if (prevProps[param] !== nextProps[param]) {
      return false;
    }
  }
  return true;
});
