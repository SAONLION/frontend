import { useState } from 'react';
import backgroundImage from '../../assets/images/stage-a-background.png';
import arrowUpIcon from '../../assets/images/icon-arrow-up.svg';
import { DocentStage } from '../../components/domain/DocentStage';
import TextInput from '../../components/common/TextInput';
import CircleIconButton from '../../components/common/CircleIconButton';

interface G3EmailInputProps {
  headline?: string;
  placeholder?: string;
  onSubmit?: (email: string) => void;
}

export default function G3EmailInput({
  headline = '콘텐츠를 받아보기 위해서는 이메일 입력이 필요해요',
  placeholder = '이메일',
  onSubmit,
}: G3EmailInputProps) {
  const [email, setEmail] = useState('');

  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-black">
      <img src={backgroundImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-100.5 flex-col items-center pt-53 pb-20.9">
        <DocentStage cue="idle" className="mx-auto aspect-321/201 w-[79.85%] max-w-80.25" />
        <h1 className="mt-9.25 max-w-71.5 text-center text-[22.5px] font-semibold leading-[1.42] text-white">
          {headline}
        </h1>
        <TextInput
          value={email}
          onChange={setEmail}
          placeholder={placeholder}
          className="mt-9.25 w-[84.6%] max-w-85"
        />
        <div className="mt-auto flex w-[84.6%] max-w-85 justify-end">
          <CircleIconButton
            icon={arrowUpIcon}
            ariaLabel="제출"
            onClick={() => onSubmit?.(email)}
          />
        </div>
      </div>
    </div>
  );
}
