import { useCallback, useEffect, useState } from 'react';
import { Redirect } from 'react-router-dom';
import Cookies from 'universal-cookie';
import { v4 as uuid } from 'uuid';

import { Container, Players } from './styles';

import { FaPowerOff } from 'react-icons/fa';

import avatarImg from '../../assets/avatar.jpg';

const cookies = new Cookies();

interface PlayerProps {
  id: string;
  name: string; 
}

interface RoomProps {
  onOpenNewPlayerModal: () => void;
}

export function Room({ onOpenNewPlayerModal }: RoomProps) {

  const isAuthenticated = cookies.get("auth_token") !== undefined;
  const ownerName = cookies.get("auth_token");

  const [players, setPlayers] = useState<PlayerProps[]>(() => {
    const storagedRepositories = localStorage.getItem('@EventialsMeeting:players');

    if(storagedRepositories) {
      return JSON.parse(storagedRepositories);
    } else {
      return [{
        id: uuid(),
        name: ownerName,
      }]
    }
  });

  const [redirect, setRedirect] = useState(false);

  const handleUserKeyPress = useCallback(event => {
    const { key } = event;

    if (key === 'i') {

      onOpenNewPlayerModal();

      const player: PlayerProps = {
        id: uuid(),
        name: '',
      }

      setPlayers([...players, player]);
    }
  }, [players]);

  useEffect(() => {
    window.addEventListener('keydown', handleUserKeyPress);

    return () => {
      window.removeEventListener('keydown', handleUserKeyPress);
    };
  }, [handleUserKeyPress]);

  useEffect(() => {
    localStorage.setItem(
      '@EventialsMeeting:players', 
      JSON.stringify(players),
    );
  }, [players])

  function handleEndMeeting() {
    cookies.remove("auth_token");
    localStorage.removeItem('@EventialsMeeting:players');
    setRedirect(true);
  }

  if (!isAuthenticated || redirect) {
    return <Redirect to="/" />
  }

  return (
    <Container>
      <header>
        <h2>Chamada de {ownerName}</h2>
      </header>

      <Players>
        {players.map(player => (
          <li key={player.id}>
            <img src={avatarImg} alt={player.name}/>
          </li>
        ))}
      </Players>

      <footer>
        <button onClick={handleEndMeeting}>
          <FaPowerOff size={30} />
        </button>
      </footer>
    </Container>
  );
}