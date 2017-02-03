import { isFunction } from 'inferno-helpers';

export default function SwitchCase(handlers: Object) {
	return (defaultHandler: any) => {
		return (key: string) => {
			if (handlers.hasOwnProperty(key)) {
				return isFunction(handlers[key]) ? handlers[key]() : handlers[key];
			}

			return isFunction(defaultHandler) ? defaultHandler() : defaultHandler;
		};
	};
}
