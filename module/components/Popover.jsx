import React, { useState, useEffect } from 'react';
import classnames from 'classnames';

import getStyle from '../utils/getStyle.js';
import formatCamelCase from '../utils/formatCamelCase.js';

const Popover = React.forwardRef((props, ref) => {
  const env = {
    state_showState : useActiveState(props.showState),
    showPosition    : (props.showPosition)? props.showPosition : 'bottom',
    showAlign       : (props.showAlign)? props.showAlign : 'begin',
    styleObj        : formatCamelCase(props.styleObj || {})
  };

  useEffect(() => {
    if (typeof props.showState != 'undefined')
    {
      if (env.state_showState.value !== props.showState) {
        env.state_showState.onToggle(props.showState);
      }
    }
  });

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

  return (
    <div ref={ref} className={classnames('btb-react-popover', props.className, `popover-align-${env.showAlign}`)} style={getStyle(env.styleObj, ['btb-react-popover'], `popover-align-${env.showAlign}`)}>
      <div className="popover_trigger" style={getStyle(env.styleObj, ['popover_trigger'])} onClick={_togglePopover}>
        {(typeof props.trigger != 'undefined')? props.trigger : 'Trigger'}
      </div>
      <div className={classnames('popover_content', {'content-show' : env.state_showState.value}, `content-position-${env.showPosition}`)} style={getStyle(env.styleObj, ['popover_content', (env.state_showState.value)? 'content-show': '', `content-position-${env.showPosition}`])}>
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

export default Popover;