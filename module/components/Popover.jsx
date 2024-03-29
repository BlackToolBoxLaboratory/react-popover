import React, { useState, useEffect, useRef } from 'react';
import classnames from 'classnames';

import getWindowOffset from '../utils/getWindowOffset.js';
import getStyle from '../utils/getStyle.js';
import formatCamelCase from '../utils/formatCamelCase.js';

const OFFSET_SCROLLBAR = 20;

const Popover = React.forwardRef((props, ref) => {
  const env = {
    state_index      : useIndexState(),
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
    env.state_index.onUpdate(`${Date.now()}-${Math.ceil(Math.random()*1000)}`);
    _resize();
    window.addEventListener('resize', _resize);
    window.addEventListener('scroll', _resize);
    return function cleanup() {
      window.removeEventListener('resize', _resize);
      window.removeEventListener('scroll', _resize);
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
  
  useEffect(() => {
    window.removeEventListener('click', _clickListener);
    if (env.state_showState.value) {
      window.addEventListener('click', _clickListener);
    }
    return function cleanup() {
      window.removeEventListener('click', _clickListener);
    };
  }, [env.state_showState.value]);

  function _resize() {
    if (env.autoDetect) {
      env.state_autoAdjust.onAdjust({
        ...env.state_autoAdjust.value,
        ..._detectX(),
        ..._detectY()
      });
    }
  }

  function _clickListener (event) {
    let result = event.composedPath().find((node) => {
      if (node.classList)
      {
        return node.classList.value.search(`popover-${env.state_index.value}`) > 0;
      }
      return false;
    });
    if (typeof result == 'undefined') {
      _togglePopover();
    }
  }

  function _togglePopover () {
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
    <div ref={ref} className={classnames('btb-react-popover', `popover-${env.state_index.value}`, props.className, `popover-align-${computed_align}`, {'popover-arrow' : env.withArrow})} style={getStyle(env.styleObj, ['btb-react-popover', `popover-align-${computed_align}`, (env.withArrow)? 'popover-arrow' : ''])}>
      <div ref={ref_trigger} className="popover_trigger" style={getStyle(env.styleObj, ['popover_trigger'])} onClick={_togglePopover}>
        {(typeof props.trigger != 'undefined')? props.trigger : 'Trigger'}
      </div>
      <div ref={ref_content} className={classnames('popover_content', {'content-show' : env.state_showState.value}, `content-position-${computed_position}`)} style={getStyle(env.styleObj, ['popover_content', (env.state_showState.value)? 'content-show': '', `content-position-${computed_position}`])}>
        {props.children || 'Empty'}
      </div>
    </div>
  );
});

function useIndexState () {
  const [value, setState] = useState();
  return {
    value,
    onUpdate : (state) => {
      setState(state);
    }
  };
}

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