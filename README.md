### Draw SVG

Component made when creating [my website](allan-lago.herokuapp.com). I found this component to be an easier method to control animations that are fundamentally CSS-only but that need some connection with Javascript code in ReactJS. For instance, with this it is easy to call one or many animations with a button click without having to search through the DOM tree or (in the case of many elements in the tree) without having to create many references.

It facilitates the popular animation of path components of an svg.

#### What it makes easier

- Drawing an svg forwards and backwards.
- Dynamically setting each animation's duration, delay, and easing function in Javascript/JSX.

#### How to do it (2 Steps)

- In the .svg file, make sure that all path tags have the prop _pathLength="1"_. Adding this will not affect your svg, but will make it possible to generalize the animation.
  - Very old versions of Safari seem to have an issue where the browser does not accept the pathLenth argument: [Solution](https://stackoverflow.com/questions/51889547/svg-pathlength-dont-work-on-safari)

* Wrap the svg you want to animate with the _\<DrawSVG>_ _\</DrawSVG>_ tags.

Example:

```javascript
import { ReactComponent as SVGReactComponent } from "./my_svgs_path.svg";
import DrawSVG from "react-drawsvg";
```

```html
<DrawSVG
  startTransparent
  duration={5000}
  delay={3000}
  easingFunction="ease-in"
>
  <SVGReactComponent />
</DrawSVG>
```

#### Requirements for this to work

- No other animations affect the _DrawSVG_'s descendents.
- _DrawSVG_ should only have one child
  - This requirement could be changed in the source code by changing _DrawSVG_'s children from '_child_' to '_props.children_' but I have not tested anything on that realm.

#### Optional Arguments

- duration: [String / Number] milliseconds
- delay: [String / Number] milliseconds
- easingFunction: [String] denoting the CSS's animation easing function
- disableFilling: [Boolean] sets the svg's path fill to "transparent" (cannot be reverted)
- startTransparent: [Boolean] sets the svg's path fill to "transparent" only while the animation is on delay (only valid for composition)

#### Usage Examples

The first draw's parameters are determined by the paremeters given in the props or (in their absence) their default values. Subsequent draws may be called by the methods inside the Imperative Handle.

Excerpt from source code:

```javascript
useImperativeHandle(ref, () => ({
  playStartAnimation({
    duration = 2000,
    delay = 0,
    easingFunction = "ease",
    disableFilling = false,
    startTransparent = false,
  }) {
    //... [code goes here]
    return new Promise((resolve) => setTimeout(resolve, duration + delay));
  },
  playEndAnimation({
    duration = 2000,
    delay = 0,
    easingFunction = "ease",
    disableFilling = false,
    startTransparent = false,
  }) {
    //... [code goes here]
    return new Promise((resolve) => setTimeout(resolve, duration + delay));
  },
}));
```

This means that if you link the _DrawSVG_ tag with a reference such as:

```javascript
const myDrawRef = useRef();
//... [code goes here]
<DrawSVG ref={myDrawRef}>
```

You can later use this reference to call these animations. And, since the _playStartAnimation_ and _playEndAnimation_ functions return Promises you can follow these with some other commands by calling .then:

```javascript
<button
  type="button"
  onClick={() => {
    //change page after animation is done
    myDrawRef.current.playEndAnimation().then(handleAnimationEnd());
  }}
>
  Next Page
</button>
```

Additionally, for when undrawing multiple components, I added a prop '_undraw_' which is an object containing the same parameters as the DrawSVG component. Set an ancestor to the DrawSVG component to have a state variable 'shouldUndraw' (and leave it undefined) and pass it down to the DrawSVG component descendants.

```javascript
//Some React Component
const MyPage = (props) => {
  //once shouldUndraw is defined, it will trigger the undraw
  //animation of all DrawSVG's that have it as a prop
  const [shouldUndraw, setUndraw] = setState()

  return (
    <div>
    <button type="button" onClick={()=> setState({
      duration: 2000,
      delay:1000,
      easingFunction="cubic-bezier(0.17, 0.67, 0.83, 0.67)"
      }
      )}>
    //... [code goes here]
    <DrawSVG undraw={shouldUndraw}>
      <SVGOne>
    </DrawSVG>
    //... [more svg elements]
    <DrawSVG undraw={shouldUndraw}>
      <SVGTen>
    </DrawSVG>
    </div>
  );
}
```

In this case clicking the button will trigger all DrawSVGs that have the undraw prop set to shouldUndraw and will execute the EndAnimation with the parameters given.
