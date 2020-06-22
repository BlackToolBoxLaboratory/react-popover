import React, { useState, useEffect, useRef } from 'react';
import classnames from 'classnames';

import getWindowOffset from '../utils/getWindowOffset.js';
import getStyle from '../utils/getStyle.js';
import formatCamelCase from '../utils/formatCamelCase.js';

const OFFSET_SCROLLBAR = 20;

const Popover = React.forwardRef((props, ref) => {
  const env = {
    state_showState  : useActiveState(props.showState),
    state_autoAdjust : useAdjustState({position : '', align : ''}),
    autoDetect       : (typeof props.autoDetect != 'undefined')? props.autoDetect : true,
    withArrow        : (typeof props.withArrow != 'undefined')? props.withArrow : true,
    showPosition     : (props.showPosition)? props.showPosition : 'bottom',
    showAlign        : (props.showAlign)? props.showAlign : 'begin',
    styleObj         : formatCamelCase(props.styleObj || {})
  };
  const ref_trigger = useRef(null);
  const ref_content = useRef(null);
  const computed_position = env.state_autoAdjust.value.position || env.showPosition;
  const computed_align = env.state_autoAdjust.value.align || env.showAlign;

  useEffect(() => {
    _resize();
    window.addEventListener('resize', _resize);
    window.addEventListener('scroll', _scroll);
    return function cleanup() {
      window.removeEventListener('resize', _resize);
      window.removeEventListener('scroll', _scroll);
    };
  }, []);

  useEffect(() => {
    _resize();
  }, [env.state_showState.value, computed_position, computed_align]);

  useEffect(() => {
    if (typeof props.showState != 'undefined')
    {
      if (env.state_showState.value !== props.showState) {
        env.state_showState.onToggle(props.showState);
      }
    }
  });

  function _resize() {
    if (env.autoDetect) {
      env.state_autoAdjust.onAdjust({
        ...env.state_autoAdjust.value,
        ..._detectX(),
        ..._detectY()
      });
    }
  }
  function _scroll() {
    if (env.autoDetect) {
      env.state_autoAdjust.onAdjust({
        ...env.state_autoAdjust.value,
        ..._detectY()
      });
    }
  }

  function _togglePopover () {
    if (props.stateLock) {
      return;
    }

    if (typeof props.onToggle != 'undefined') {
      props.onToggle(!env.state_showState.value);
    }
    if (env.state_showState.value) {
      if (typeof props.onHide != 'undefined') {
        props.onHide();
      }
    } else {
      if (typeof props.onShow != 'undefined') {
        props.onShow();
      }
    }
    env.state_showState.onToggle();
  }

  function _detectX () {
    const trigger = ref_trigger.current;
    const content = ref_content.current;
    const windowOffset_trigger = getWindowOffset(trigger);

    if (windowOffset_trigger.left - content.scrollWidth  < 0) 
    {
      if (env.showPosition === 'left') {
        return {
          position : 'right'
        };
      }
      if ((env.showPosition === 'top') 
        || (env.showPosition === 'bottom')) {
        return {
          align : 'begin'
        };
      }
    } else if (windowOffset_trigger.left + trigger.scrollWidth + content.scrollWidth + OFFSET_SCROLLBAR > window.innerWidth ) {
      if (env.showPosition === 'right') {
        return {
          position : 'left'
        };
      }
      if ((env.showPosition === 'top') 
        || (env.showPosition === 'bottom')) {
        return {
          align : 'end'
        };
      }
    }
    return {};
  }
  function _detectY() {
    const trigger = ref_trigger.current;
    const content = ref_content.current;
    const windowOffset_trigger = getWindowOffset(trigger);
    if (windowOffset_trigger.top - content.scrollHeight  < 0) 
    {
      if (env.showPosition === 'top') {
        return {
          position : 'bottom'
        };
      }
      if ((env.showPosition === 'left') 
        || (env.showPosition === 'right')) {
        return {
          align : 'begin'
        };
      }
    } else if (windowOffset_trigger.top + trigger.scrollHeight + content.scrollHeight + OFFSET_SCROLLBAR > window.innerHeight ) {
      if (env.showPosition === 'bottom') {
        return {
          position : 'top'
        };
      }
      if ((env.showPosition === 'left') 
        || (env.showPosition === 'right')) {
        return {
          align : 'end'
        };
      }
    }
    return {};
  }

  return (
    <div ref={ref} className={classnames('btb-react-popover', props.className, `popover-align-${computed_align}`, {'popover-arrow' : env.withArrow})} style={getStyle(env.styleObj, ['btb-react-popover', `popover-align-${computed_align}`, (env.withArrow)? 'popover-arrow' : ''])}>
      <div ref={ref_trigger} className="popover_trigger" style={getStyle(env.styleObj, ['popover_trigger'])} onClick={_togglePopover}>
        {(typeof props.trigger != 'undefined')? props.trigger : 'Trigger'}
      </div>
      <div ref={ref_content} className={classnames('popover_content', {'content-show' : env.state_showState.value}, `content-position-${computed_position}`)} style={getStyle(env.styleObj, ['popover_content', (env.state_showState.value)? 'content-show': '', `content-position-${computed_position}`])}>
        {props.children}
      </div>
    </div>
  );
});

function useActiveState(defaultSate) {
  const [value, setState] = useState(defaultSate);
  return {
    value,
    onToggle : (state) => {
      if (typeof state == 'boolean') {
        setState(state);
      } else {
        setState(!value);
      }
    }
  };
}

function useAdjustState(defaultSate) {
  const [value, setState] = useState(defaultSate);
  return {
    value,
    onAdjust : (state) => {
      setState(state);
    }
  };
}

export default Popover;