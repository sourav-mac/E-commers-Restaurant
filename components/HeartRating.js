import React from 'react'
import styled from 'styled-components'

const HeartRating = ({ rating, onRatingChange }) => {
  return (
    <StyledWrapper>
      <div className="rating">
        <input 
          type="radio" 
          id="heart5" 
          name="rate" 
          value="5"
          checked={rating === 5}
          onChange={() => onRatingChange(5)}
        />
        <label htmlFor="heart5" title="Amazing!">
          <svg viewBox="0 0 24 24" height="1em" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill="currentColor"
            ></path>
          </svg>
        </label>

        <input 
          type="radio" 
          id="heart4" 
          name="rate" 
          value="4"
          checked={rating === 4}
          onChange={() => onRatingChange(4)}
        />
        <label htmlFor="heart4" title="Great!">
          <svg viewBox="0 0 24 24" height="1em" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill="currentColor"
            ></path>
          </svg>
        </label>

        <input 
          type="radio" 
          id="heart3" 
          name="rate" 
          value="3"
          checked={rating === 3}
          onChange={() => onRatingChange(3)}
        />
        <label htmlFor="heart3" title="Good">
          <svg viewBox="0 0 24 24" height="1em" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill="currentColor"
            ></path>
          </svg>
        </label>

        <input 
          type="radio" 
          id="heart2" 
          name="rate" 
          value="2"
          checked={rating === 2}
          onChange={() => onRatingChange(2)}
        />
        <label htmlFor="heart2" title="Average">
          <svg viewBox="0 0 24 24" height="1em" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill="currentColor"
            ></path>
          </svg>
        </label>

        <input 
          type="radio" 
          id="heart1" 
          name="rate" 
          value="1"
          checked={rating === 1}
          onChange={() => onRatingChange(1)}
        />
        <label htmlFor="heart1" title="Poor">
          <svg viewBox="0 0 24 24" height="1em" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill="currentColor"
            ></path>
          </svg>
        </label>
      </div>
    </StyledWrapper>
  )
}

const StyledWrapper = styled.div`
  .rating > label {
    margin-right: 4px;
  }

  .rating:not(:checked) > input {
    display: none;
  }

  .rating:not(:checked) > label {
    float: right;
    cursor: pointer;
    font-size: 24px;
    color: #d1d5db;
  }

  .rating:not(:checked) > label > svg {
    transition: fill 0.3s ease, transform 0.3s ease;
  }

  .rating > input:checked ~ label > svg {
    transform: scale(1.1);
  }

  .rating:not(:checked) > label:hover ~ label,
  .rating:not(:checked) > label:hover {
    color: #ff1a1a;
    transform: scale(1.05);
  }

  /* Color for each heart rating */
  #heart1:checked ~ label {
    color: #ff0000;
  }

  #heart2:checked ~ label {
    color: #ff6600;
  }

  #heart3:checked ~ label {
    color: #ffcc00;
  }

  #heart4:checked ~ label {
    color: #00cc00;
  }

  #heart5:checked ~ label {
    color: #9900ff;
  }

  /* Hover colors */
  #heart1:hover ~ label,
  #heart1:hover {
    color: #e60000 !important;
  }

  #heart2:hover ~ label,
  #heart2:hover {
    color: #e66a00 !important;
  }

  #heart3:hover ~ label,
  #heart3:hover {
    color: #e6b600 !important;
  }

  #heart4:hover ~ label,
  #heart4:hover {
    color: #00b300 !important;
  }

  #heart5:hover ~ label,
  #heart5:hover {
    color: #6600e6 !important;
  }
`

export default HeartRating
