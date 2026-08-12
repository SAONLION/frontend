import { useState } from 'react';
import backgroundImage from '../../assets/images/stage-a-background.png';
import emblemImage from '../../assets/images/mcm-emblem.png';
import ImageFrame from '../../components/common/ImageFrame';
import TextInput from '../../components/common/TextInput';
import CircleIconButton from '../../components/common/CircleIconButton';
import arrowUpIcon from '../../assets/images/icon-arrow-up.svg';

interface A2NicknameSetupProps {
  headline?: string;
  placeholder?: string;
  onSubmit?: (nickname: string) => void;
}

export default function A2NicknameSetup({
  headline = '고객님을 어떻게 불러드리면 좋을까요?',
  placeholder = '이름/닉네임',
  onSubmit,
}: A2NicknameSetupProps) {
  const [nickname, setNickname] = useState('');

  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-black">
      <img src={backgroundImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-100.5 flex-col items-center pt-64.25">
        <ImageFrame
          src={emblemImage}
          alt="MCM 엠블럼"
          className="mx-auto aspect-321/201 w-[79.85%] max-w-80.25"
        />
        <h1 className="mt-17.5 w-full px-[8.7%] text-left text-[22px] font-semibold leading-normal text-white">
          {headline}
        </h1>
        <TextInput
          value={nickname}
          onChange={setNickname}
          placeholder={placeholder}
          className="mt-17.5 w-[84.6%] max-w-85"
        />
        <CircleIconButton
          icon={arrowUpIcon}
          ariaLabel="다음"
          onClick={() => onSubmit?.(nickname)}
          className="mt-17.5"
        />
      </div>
    </div>
  );
}
